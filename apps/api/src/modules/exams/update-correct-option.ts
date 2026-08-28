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
	UpdateCorrectOptionBody,
	UpdateCorrectOptionParams,
} from './update-correct-option-schema'

export async function updateCorrectOptionModule(
	request: FastifyRequest<{
		Params: UpdateCorrectOptionParams
		Body: UpdateCorrectOptionBody
	}>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId, questionId } = request.params
	const { optionId } = request.body

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

	const [option] = await db
		.select()
		.from(questionOptionsTable)
		.where(eq(questionOptionsTable.id, optionId))

	if (!option || option.questionId !== questionId) {
		throw new NotFoundError('Alternativa não encontrada.')
	}

	await db.transaction(async (tx) => {
		await tx
			.update(questionOptionsTable)
			.set({ isCorrect: false })
			.where(eq(questionOptionsTable.questionId, questionId))

		await tx
			.update(questionOptionsTable)
			.set({ isCorrect: true })
			.where(eq(questionOptionsTable.id, optionId))
	})

	const options = await db
		.select()
		.from(questionOptionsTable)
		.where(eq(questionOptionsTable.questionId, questionId))

	return reply.status(200).send({
		id: question.id,
		order: question.order,
		statement: question.statement,
		type: question.type,
		maxPoints: question.maxPoints,
		options,
	})
}
