import {
	classroomsTable,
	db,
	eq,
	examsTable,
	questionOptionsTable,
	questionsTable,
	subjectsTable,
} from '@app/db'
import type { GenerateExamInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { generateExamQuestions } from '@/lib/ai/gemini'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateExamCache } from './exam-cache'
import type { ExamParams } from './exam-params-schema'
import { fetchExamDetail } from './fetch-exam-detail'
import { generateMixedQuestions } from './generate-mixed-questions'

export async function generateExamModule(
	request: FastifyRequest<{ Params: ExamParams; Body: GenerateExamInput }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId } = request.params
	const {
		topic,
		difficulty,
		questionCount,
		questionType,
		multipleChoiceCount,
	} = request.body

	const [exam] = await db
		.select()
		.from(examsTable)
		.where(eq(examsTable.id, examId))

	if (!exam || exam.creatorId !== user.id) {
		throw new NotFoundError('Prova não encontrada.')
	}

	const [classroom] = await db
		.select({ subjectName: subjectsTable.name })
		.from(classroomsTable)
		.innerJoin(subjectsTable, eq(classroomsTable.subjectId, subjectsTable.id))
		.where(eq(classroomsTable.id, exam.classroomId))

	if (!classroom) {
		throw new NotFoundError('Turma não encontrada.')
	}

	const generatedQuestions =
		questionType === 'mixed'
			? await generateMixedQuestions({
					subject: classroom.subjectName,
					topic,
					difficulty,
					questionCount,
					multipleChoiceCount: multipleChoiceCount ?? 0,
				})
			: (
					await generateExamQuestions({
						subject: classroom.subjectName,
						topic,
						difficulty,
						questionCount,
						questionType,
					})
				).map((generated) => ({ ...generated, type: questionType }))

	await db.transaction(async (tx) => {
		await tx.delete(questionsTable).where(eq(questionsTable.examId, examId))

		for (const [index, generated] of generatedQuestions.entries()) {
			const [questionRow] = await tx
				.insert(questionsTable)
				.values({
					examId,
					order: index,
					statement: generated.statement,
					type: generated.type,
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

	await invalidateExamCache(examId, exam.classroomId)

	const updatedExam = await fetchExamDetail(examId)

	return reply.status(200).send(updatedExam)
}
