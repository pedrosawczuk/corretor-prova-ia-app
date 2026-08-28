import {
	classroomsTable,
	db,
	eq,
	examsTable,
	questionOptionsTable,
	questionsTable,
} from '@app/db'
import type { GenerateExamInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { generateExamQuestions } from '@/lib/gemini'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import type { ExamParams } from './exam-params-schema'
import { fetchExamDetail } from './fetch-exam-detail'

export async function generateExamModule(
	request: FastifyRequest<{ Params: ExamParams; Body: GenerateExamInput }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId } = request.params
	const { difficulty, questionCount, questionType } = request.body

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

	const generatedQuestions = await generateExamQuestions({
		subject: classroom.subject,
		difficulty,
		questionCount,
		questionType,
	})

	await db.transaction(async (tx) => {
		await tx.delete(questionsTable).where(eq(questionsTable.examId, examId))

		for (const [index, generated] of generatedQuestions.entries()) {
			const [questionRow] = await tx
				.insert(questionsTable)
				.values({
					examId,
					order: index,
					statement: generated.statement,
					type: questionType,
					maxPoints: '1.00',
				})
				.returning()

			await tx.insert(questionOptionsTable).values(
				generated.options.map((option) => ({
					questionId: questionRow.id,
					letter: option.letter,
					text: option.text,
					isCorrect: option.isCorrect,
				})),
			)
		}

		await tx
			.update(examsTable)
			.set({ totalPoints: questionCount.toFixed(2) })
			.where(eq(examsTable.id, examId))
	})

	const updatedExam = await fetchExamDetail(examId)

	return reply.status(200).send(updatedExam)
}
