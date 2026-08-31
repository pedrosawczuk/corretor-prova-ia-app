import { db, eq, submissionAnswersTable, submissionPagesTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { getSubmissionPageSignedUrl } from '@/lib/storage/storage'
import { fetchOwnedSubmission } from './fetch-owned-submission'
import type { SubmissionParams } from './submission-params-schema'

export async function getSubmissionModule(
	request: FastifyRequest<{ Params: SubmissionParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { submissionId } = request.params

	const { submission } = await fetchOwnedSubmission(submissionId, user.id)

	const pages = await db
		.select()
		.from(submissionPagesTable)
		.where(eq(submissionPagesTable.submissionId, submissionId))
		.orderBy(submissionPagesTable.pageNumber)

	const answers = await db
		.select()
		.from(submissionAnswersTable)
		.where(eq(submissionAnswersTable.submissionId, submissionId))

	const pagesWithUrl = await Promise.all(
		pages.map(async (page) => ({
			...page,
			imageUrl: await getSubmissionPageSignedUrl(page.imageUrl),
		})),
	)

	return reply.status(200).send({ ...submission, pages: pagesWithUrl, answers })
}
