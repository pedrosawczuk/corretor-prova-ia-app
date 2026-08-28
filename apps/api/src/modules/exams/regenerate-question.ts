import {
	classroomsTable,
	db,
	eq,
	examsTable,
	questionOptionsTable,
	questionsTable,
} from '@app/db'
import type {
	RegenerateQuestionBody,
	RegenerateQuestionParams,
} from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { generateExamQuestions } from '@/lib/gemini'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

export async function regenerateQuestionModule(
	request: FastifyRequest<{
		Params: RegenerateQuestionParams
		Body: RegenerateQuestionBody
	}>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId, questionId } = request.params
	const { difficulty } = request.body

	const [exam] = await db
		.select()
		.from(examsTable)
		.where(eq(examsTable.id, examId))

	if (!exam || exam.creatorId !== user.id) {
		throw new NotFoundError('Prova não encontrada.')
	}

	const [classroom] = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.id, exam.classroomId))

	if (!classroom) {
		throw new NotFoundError('Turma não encontrada.')
	}

	const [question] = await db
		.select()
		.from(questionsTable)
		.where(eq(questionsTable.id, questionId))

	if (!question || question.examId !== examId) {
		throw new NotFoundError('Questão não encontrada.')
	}

	const generatedQuestions = await generateExamQuestions({
		subject: classroom.subject,
		difficulty,
		questionCount: 1,
		questionType: question.type,
	})

	const generated = generatedQuestions[0]

	await db.transaction(async (tx) => {
		await tx
			.update(questionsTable)
			.set({ statement: generated.statement })
			.where(eq(questionsTable.id, questionId))

		await tx
			.delete(questionOptionsTable)
			.where(eq(questionOptionsTable.questionId, questionId))

		await tx.insert(questionOptionsTable).values(
			generated.options.map((option) => ({
				questionId,
				letter: option.letter,
				text: option.text,
				isCorrect: option.isCorrect,
			})),
		)
	})

	const updatedQuestion = await db
		.select()
		.from(questionsTable)
		.where(eq(questionsTable.id, questionId))

	const updatedOptions = await db
		.select()
		.from(questionOptionsTable)
		.where(eq(questionOptionsTable.questionId, questionId))

	return reply.status(200).send({
		...updatedQuestion[0],
		options: updatedOptions,
	})
}
