import { db, eq, submissionPagesTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { BadRequestError, ConflictError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { getSubmissionPageSignedUrl } from '@/lib/storage/storage'
import { extractMarkersFound } from '@/lib/vision/read-submission-answers'
import { fetchOwnedSubmission } from './fetch-owned-submission'
import { NON_EDITABLE_SUBMISSION_STATUSES } from './non-editable-submission-statuses'
import type { ReorderSubmissionPagesBody } from './reorder-submission-pages-schema'
import type { SubmissionParams } from './submission-params-schema'

export async function reorderSubmissionPagesModule(
	request: FastifyRequest<{
		Params: SubmissionParams
		Body: ReorderSubmissionPagesBody
	}>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { submissionId } = request.params
	const { pageIds } = request.body

	const { submission } = await fetchOwnedSubmission(submissionId, user.id)

	if (NON_EDITABLE_SUBMISSION_STATUSES.has(submission.status)) {
		throw new ConflictError(
			'Não é possível reordenar páginas de uma submissão já processada.',
		)
	}

	const existingPages = await db
		.select({ id: submissionPagesTable.id })
		.from(submissionPagesTable)
		.where(eq(submissionPagesTable.submissionId, submissionId))

	const existingIds = new Set(existingPages.map((page) => page.id))
	const incomingIds = new Set(pageIds)

	const isSameSet =
		pageIds.length === existingPages.length &&
		incomingIds.size === existingPages.length &&
		pageIds.every((id) => existingIds.has(id))

	if (!isSameSet) {
		throw new BadRequestError(
			'A nova ordem precisa incluir exatamente as páginas já enviadas.',
		)
	}

	await db.transaction(async (tx) => {
		for (const [index, pageId] of pageIds.entries()) {
			await tx
				.update(submissionPagesTable)
				.set({ pageNumber: index + 1 })
				.where(eq(submissionPagesTable.id, pageId))
		}
	})

	const updatedPages = await db
		.select()
		.from(submissionPagesTable)
		.where(eq(submissionPagesTable.submissionId, submissionId))
		.orderBy(submissionPagesTable.pageNumber)

	const pagesWithUrl = await Promise.all(
		updatedPages.map(async (page) => {
			const { rawOcrPayload, ...pageFields } = page
			return {
				...pageFields,
				imageUrl: await getSubmissionPageSignedUrl(page.imageUrl),
				markersFound: extractMarkersFound(rawOcrPayload),
			}
		}),
	)

	return reply.status(200).send(pagesWithUrl)
}
