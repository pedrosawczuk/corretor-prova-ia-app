import { db, desc, eq, examsTable, submissionsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import type { ExamSubmissionsParams } from './submission-params-schema'

export async function listSubmissionsModule(
	request: FastifyRequest<{ Params: ExamSubmissionsParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId } = request.params

	const [exam] = await db
		.select()
		.from(examsTable)
		.where(eq(examsTable.id, examId))

	if (!exam || exam.creatorId !== user.id) {
		throw new NotFoundError('Prova não encontrada.')
	}

	const submissions = await db
		.select()
		.from(submissionsTable)
		.where(eq(submissionsTable.examId, examId))
		.orderBy(desc(submissionsTable.createdAt))

	return reply.status(200).send(submissions)
}
