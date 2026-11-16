import { Worker } from 'node:worker_threads'
import { db, eq, submissionPagesTable, submissionsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'
import { BadRequestError, ConflictError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import {
	getSubmissionPageSignedUrl,
	MAX_SUBMISSION_PAGE_SIZE_BYTES,
	uploadSubmissionPage,
} from '@/lib/storage/storage'
import { fetchOwnedSubmission } from './fetch-owned-submission'
import { NON_EDITABLE_SUBMISSION_STATUSES } from './non-editable-submission-statuses'
import type { SubmissionParams } from './submission-params-schema'

const MAX_PAGE_DIMENSION = 1600
const MIN_PAGE_DIMENSION = 900
const HEIC_MIME_TYPES = new Set(['image/heic', 'image/heif'])
const MAX_INPUT_PIXELS = 30_000_000
const MAX_ISOBMFF_DEPTH = 16
const HEIC_DECODE_TIMEOUT_MS = 15_000

const HEIC_WORKER_SCRIPT = `
const { parentPort, workerData } = require('node:worker_threads');
const heicConvert = require('heic-convert');

(async () => {
	const converted = await heicConvert({
		buffer: Buffer.from(workerData.buffer),
		format: 'JPEG',
		quality: 0.92,
	});
	const out = Buffer.from(converted);
	parentPort.postMessage(out, [out.buffer]);
})().catch((err) => {
	setImmediate(() => { throw err; });
});
`

const ISOBMFF_CONTAINER_BOXES = new Set([
	'meta',
	'iprp',
	'ipco',
	'moov',
	'trak',
	'mdia',
	'minf',
	'stbl',
])

function extractHeicIspeDimensions(
	buffer: Buffer,
	start = 0,
	end = buffer.length,
	results: Array<{ width: number; height: number }> = [],
	depth = 0,
): Array<{ width: number; height: number }> {
	if (depth >= MAX_ISOBMFF_DEPTH) return results

	let offset = start

	while (offset + 8 <= end) {
		const rawSize = buffer.readUInt32BE(offset)
		const type = buffer.toString('ascii', offset + 4, offset + 8)
		let headerSize = 8
		let boxSize = rawSize

		if (rawSize === 1) {
			if (offset + 16 > end) break
			const largeSize = Number(buffer.readBigUInt64BE(offset + 8))
			if (!Number.isSafeInteger(largeSize) || largeSize < 16) break
			headerSize = 16
			boxSize = largeSize
		} else if (rawSize === 0) {
			boxSize = end - offset
		} else if (rawSize < 8) {
			break
		}

		const boxEnd = Math.min(offset + boxSize, end)
		const payloadStart = offset + headerSize

		if (type === 'ispe') {
			// FullBox: 4 bytes version/flags + 4 bytes width + 4 bytes height
			if (payloadStart + 12 <= boxEnd) {
				const width = buffer.readUInt32BE(payloadStart + 4)
				const height = buffer.readUInt32BE(payloadStart + 8)
				results.push({ width, height })
			}
		} else if (ISOBMFF_CONTAINER_BOXES.has(type)) {
			// `meta` is a FullBox (4-byte version/flags before child boxes)
			const childStart = type === 'meta' ? payloadStart + 4 : payloadStart
			if (childStart < boxEnd) {
				extractHeicIspeDimensions(
					buffer,
					childStart,
					boxEnd,
					results,
					depth + 1,
				)
			}
		}

		if (boxEnd <= offset) break
		offset = boxEnd
	}

	return results
}

function assertHeicDimensionsWithinLimit(buffer: Buffer): void {
	const dimensions = extractHeicIspeDimensions(buffer)

	if (dimensions.length === 0) {
		throw new BadRequestError(
			'Não foi possível ler com segurança as dimensões da imagem HEIC.',
		)
	}

	for (const { width, height } of dimensions) {
		if (width <= 0 || height <= 0 || width * height > MAX_INPUT_PIXELS) {
			throw new BadRequestError(
				'A imagem enviada é grande demais para ser processada.',
			)
		}
	}
}

function convertHeicInWorker(buffer: Buffer): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(HEIC_WORKER_SCRIPT, {
			eval: true,
			workerData: { buffer },
			resourceLimits: {
				maxOldGenerationSizeMb: 256,
				maxYoungGenerationSizeMb: 64,
			},
		})

		let settled = false
		const timer = setTimeout(() => {
			if (settled) return
			settled = true
			void worker.terminate()
			reject(
				new BadRequestError(
					'Tempo limite excedido ao decodificar a imagem HEIC.',
				),
			)
		}, HEIC_DECODE_TIMEOUT_MS)

		worker.once('message', (result: Uint8Array) => {
			if (settled) return
			settled = true
			clearTimeout(timer)
			void worker.terminate()
			resolve(Buffer.from(result))
		})

		worker.once('error', () => {
			if (settled) return
			settled = true
			clearTimeout(timer)
			reject(
				new BadRequestError(
					'Não foi possível decodificar com segurança a imagem HEIC.',
				),
			)
		})

		worker.once('exit', (code) => {
			if (settled) return
			settled = true
			clearTimeout(timer)
			if (code !== 0) {
				reject(
					new BadRequestError(
						'Não foi possível decodificar com segurança a imagem HEIC.',
					),
				)
			}
		})
	})
}

async function decodeToJpegCompatibleBuffer(
	buffer: Buffer,
	mime: string,
): Promise<Buffer> {
	if (!HEIC_MIME_TYPES.has(mime)) return buffer

	assertHeicDimensionsWithinLimit(buffer)

	return convertHeicInWorker(buffer)
}

export async function uploadSubmissionPageModule(
	request: FastifyRequest<{ Params: SubmissionParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { submissionId } = request.params

	const { submission, exam } = await fetchOwnedSubmission(submissionId, user.id)

	if (NON_EDITABLE_SUBMISSION_STATUSES.has(submission.status)) {
		throw new ConflictError(
			'Não é possível adicionar páginas a uma submissão já processada.',
		)
	}

	const file = await request
		.file({ limits: { fileSize: MAX_SUBMISSION_PAGE_SIZE_BYTES } })
		.catch((error) => {
			if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
				throw new BadRequestError('A imagem deve ter no máximo 10MB.')
			}
			throw error
		})

	if (!file) throw new BadRequestError('Nenhum arquivo enviado.')

	const originalBuffer = await file.toBuffer().catch((error) => {
		if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
			throw new BadRequestError('A imagem deve ter no máximo 10MB.')
		}
		throw error
	})

	const fileType = await fileTypeFromBuffer(originalBuffer)
	if (!fileType?.mime.startsWith('image/')) {
		throw new BadRequestError('O arquivo enviado precisa ser uma imagem.')
	}

	const decodableBuffer = await decodeToJpegCompatibleBuffer(
		originalBuffer,
		fileType.mime,
	)

	const { width, height } = await sharp(decodableBuffer, {
		limitInputPixels: MAX_INPUT_PIXELS,
	})
		.metadata()
		.catch(() => {
			throw new BadRequestError(
				'A imagem enviada é grande demais para ser processada.',
			)
		})
	if (!width || !height || Math.min(width, height) < MIN_PAGE_DIMENSION) {
		throw new BadRequestError(
			'A foto está com resolução muito baixa para leitura confiável — tire a foto mais de perto ou com mais qualidade.',
		)
	}

	// Folhas de resposta são preto-e-branco por natureza: grayscale corta o
	// peso do arquivo (upload, storage e download antes da IA) sem perder
	// nenhuma informação relevante para identificar a marcação do aluno.
	const normalizedBuffer = await sharp(decodableBuffer, {
		limitInputPixels: MAX_INPUT_PIXELS,
	})
		.rotate()
		.resize(MAX_PAGE_DIMENSION, MAX_PAGE_DIMENSION, {
			fit: 'inside',
			withoutEnlargement: true,
		})
		.grayscale()
		.jpeg({ quality: 90 })
		.toBuffer()

	const page = await db.transaction(async (tx) => {
		await tx
			.select({ id: submissionsTable.id })
			.from(submissionsTable)
			.where(eq(submissionsTable.id, submissionId))
			.for('update')

		const existingPages = await tx
			.select({ pageNumber: submissionPagesTable.pageNumber })
			.from(submissionPagesTable)
			.where(eq(submissionPagesTable.submissionId, submissionId))

		if (
			exam.templatePageCount != null &&
			existingPages.length >= exam.templatePageCount
		) {
			throw new ConflictError(
				`Esta prova possui ${exam.templatePageCount} página(s); não é possível enviar mais páginas.`,
			)
		}

		const objectName = await uploadSubmissionPage(
			normalizedBuffer,
			'image/jpeg',
		)

		const [created] = await tx
			.insert(submissionPagesTable)
			.values({
				submissionId,
				pageNumber: existingPages.length + 1,
				imageUrl: objectName,
			})
			.returning()

		return created
	})

	return reply.status(201).send({
		...page,
		imageUrl: await getSubmissionPageSignedUrl(page.imageUrl),
	})
}
