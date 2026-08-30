import {
	db,
	eq,
	examsTable,
	questionOptionsTable,
	questionsTable,
} from '@app/db'
import type { UpdateQuestionBody, UpdateQuestionParams } from '@app/shared'
import { letterForOptionIndex } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateExamCache } from './exam-cache'
import { questionOptionsOrderBy } from './question-option-order'

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

		for (const [index, option] of options.entries()) {
			await tx
				.update(questionOptionsTable)
				.set({
					text: option.text,
					letter: letterForOptionIndex(question.type, index),
				})
				.where(eq(questionOptionsTable.id, option.id))
		}
	})

	const updatedOptions = await db
		.select()
		.from(questionOptionsTable)
		.where(eq(questionOptionsTable.questionId, questionId))
		.orderBy(questionOptionsOrderBy)

	await invalidateExamCache(examId, exam.classroomId)

	return reply.status(200).send({
		id: question.id,
		order: question.order,
		statement,
		type: question.type,
		maxPoints: question.maxPoints,
		options: updatedOptions,
	})
}
