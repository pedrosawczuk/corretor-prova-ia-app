import {
	db,
	eq,
	examsTable,
	questionOptionsTable,
	questionsTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import type {
	UpdateQuestionBody,
	UpdateQuestionParams,
} from '@app/shared'

export async function updateQuestionModule(
	request: FastifyRequest<{
		Params: UpdateQuestionParams
		Body: UpdateQuestionBody
	}>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId, questionId } = request.params
	const { statement, options } = request.body

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

	await db.transaction(async (tx) => {
		await tx
			.update(questionsTable)
			.set({ statement })
			.where(eq(questionsTable.id, questionId))

		for (const option of options) {
			await tx
				.update(questionOptionsTable)
				.set({ text: option.text })
				.where(eq(questionOptionsTable.id, option.id))
		}
	})

	const updatedOptions = await db
		.select()
		.from(questionOptionsTable)
		.where(eq(questionOptionsTable.questionId, questionId))

	return reply.status(200).send({
		id: question.id,
		order: question.order,
		statement,
		type: question.type,
		maxPoints: question.maxPoints,
		options: updatedOptions,
	})
}
