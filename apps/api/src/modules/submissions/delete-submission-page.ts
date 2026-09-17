import { db, eq, submissionPagesTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError, NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import {
	deleteSubmissionPage,
	getSubmissionPageSignedUrl,
} from '@/lib/storage/storage'
import { extractMarkersFound } from '@/lib/vision/read-submission-answers'
import { fetchOwnedSubmission } from './fetch-owned-submission'
import { NON_EDITABLE_SUBMISSION_STATUSES } from './non-editable-submission-statuses'
import type { SubmissionPageParams } from './submission-params-schema'

export async function deleteSubmissionPageModule(
	request: FastifyRequest<{ Params: SubmissionPageParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { submissionId, pageId } = request.params

	const { submission } = await fetchOwnedSubmission(submissionId, user.id)

	if (NON_EDITABLE_SUBMISSION_STATUSES.has(submission.status)) {
		throw new ConflictError(
			'Não é possível remover páginas de uma submissão já processada.',
		)
	}

	const [page] = await db
		.select()
		.from(submissionPagesTable)
		.where(eq(submissionPagesTable.id, pageId))

	if (!page || page.submissionId !== submissionId) {
		throw new NotFoundError('Página não encontrada.')
	}

	await db.transaction(async (tx) => {
		await tx
			.delete(submissionPagesTable)
			.where(eq(submissionPagesTable.id, pageId))

		const pages = await tx
			.select()
			.from(submissionPagesTable)
			.where(eq(submissionPagesTable.submissionId, submissionId))
			.orderBy(submissionPagesTable.pageNumber)

		for (const [index, remainingPage] of pages.entries()) {
			if (remainingPage.pageNumber === index + 1) continue

			await tx
				.update(submissionPagesTable)
				.set({ pageNumber: index + 1 })
				.where(eq(submissionPagesTable.id, remainingPage.id))
		}
	})

	await deleteSubmissionPage(page.imageUrl)

	const remainingPages = await db
		.select()
		.from(submissionPagesTable)
		.where(eq(submissionPagesTable.submissionId, submissionId))
		.orderBy(submissionPagesTable.pageNumber)

	const pagesWithUrl = await Promise.all(
		remainingPages.map(async (remainingPage) => {
			const { rawOcrPayload, ...pageFields } = remainingPage
			return {
				...pageFields,
				imageUrl: await getSubmissionPageSignedUrl(remainingPage.imageUrl),
				markersFound: extractMarkersFound(rawOcrPayload),
			}
		}),
	)

	return reply.status(200).send(pagesWithUrl)
}
