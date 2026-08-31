import { db, eq, submissionPagesTable } from '@app/db'
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
import type { SubmissionParams } from './submission-params-schema'

const MAX_PAGE_DIMENSION = 1600
const NON_UPLOADABLE_STATUSES = new Set(['processing', 'completed'])

export async function uploadSubmissionPageModule(
	request: FastifyRequest<{ Params: SubmissionParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { submissionId } = request.params

	const { submission } = await fetchOwnedSubmission(submissionId, user.id)

	if (NON_UPLOADABLE_STATUSES.has(submission.status)) {
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

	// Folhas de resposta são preto-e-branco por natureza: grayscale corta o
	// peso do arquivo (upload, storage e download antes da IA) sem perder
	// nenhuma informação relevante para identificar a marcação do aluno.
	const normalizedBuffer = await sharp(originalBuffer)
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
