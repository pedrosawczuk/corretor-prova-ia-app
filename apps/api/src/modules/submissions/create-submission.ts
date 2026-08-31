import { db, eq, examsTable, submissionsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import type { CreateSubmissionBody } from './create-submission-schema'
import type { ExamSubmissionsParams } from './submission-params-schema'

export async function createSubmissionModule(
	request: FastifyRequest<{
		Params: ExamSubmissionsParams
		Body: CreateSubmissionBody
	}>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId } = request.params
	const { studentIdentifier } = request.body

	const [exam] = await db
		.select()
		.from(examsTable)
		.where(eq(examsTable.id, examId))

	if (!exam || exam.creatorId !== user.id) {
		throw new NotFoundError('Prova não encontrada.')
	}

	const [submission] = await db
		.insert(submissionsTable)
		.values({
			examId,
			studentIdentifier,
			status: 'pending_processing',
		})
		.returning()

	return reply.status(201).send({ ...submission, pages: [], answers: [] })
}
