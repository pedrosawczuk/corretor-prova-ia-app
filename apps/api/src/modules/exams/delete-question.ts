import { db, eq, examsTable, questionsTable } from '@app/db'
import type { UpdateQuestionParams } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

export async function deleteQuestionModule(
	request: FastifyRequest<{
		Params: UpdateQuestionParams
	}>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId, questionId } = request.params

	const [exam] = await db
		.select()
		.from(examsTable)
		.where(eq(examsTable.id, examId))

	if (!exam || exam.creatorId !== user.id) {
		throw new NotFoundError('Prova não encontrada.')
	}

	const [question] = await db
		.select()
		.from(questionsTable)
		.where(eq(questionsTable.id, questionId))

	if (!question || question.examId !== examId) {
		throw new NotFoundError('Questão não encontrada.')
	}

	await db.delete(questionsTable).where(eq(questionsTable.id, questionId))

	return reply.status(204).send()
}
