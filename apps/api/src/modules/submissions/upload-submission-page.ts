import { db, eq, submissionPagesTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { fileTypeFromBuffer } from 'file-type'
import heicConvert from 'heic-convert'
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

async function decodeToJpegCompatibleBuffer(
	buffer: Buffer,
	mime: string,
): Promise<Buffer> {
	if (!HEIC_MIME_TYPES.has(mime)) return buffer

	const converted = await heicConvert({
		buffer,
		format: 'JPEG',
		quality: 0.92,
	})

	return Buffer.from(converted)
}

export async function uploadSubmissionPageModule(
	request: FastifyRequest<{ Params: SubmissionParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { submissionId } = request.params

	const { submission } = await fetchOwnedSubmission(submissionId, user.id)

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

	const objectName = await uploadSubmissionPage(normalizedBuffer, 'image/jpeg')

	const existingPages = await db
		.select({ pageNumber: submissionPagesTable.pageNumber })
		.from(submissionPagesTable)
		.where(eq(submissionPagesTable.submissionId, submissionId))

	const [page] = await db
		.insert(submissionPagesTable)
		.values({
			submissionId,
			pageNumber: existingPages.length + 1,
			imageUrl: objectName,
		})
		.returning()

	return reply.status(201).send({
		...page,
		imageUrl: await getSubmissionPageSignedUrl(page.imageUrl),
	})
}
