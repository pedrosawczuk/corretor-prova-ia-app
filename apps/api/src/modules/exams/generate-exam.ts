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

export async function generateExamModule(
	request: FastifyRequest<{ Body: GenerateExamInput }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { classroomId, difficulty, questionCount, questionType } =
		request.body

	const [classroom] = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.id, classroomId))

	if (!classroom || classroom.teacherId !== user.id) {
		throw new NotFoundError('Turma não encontrada.')
	}

	const generatedQuestions = await generateExamQuestions({
		subject: classroom.subject,
		difficulty,
		questionCount,
		questionType,
	})

	const exam = await db.transaction(async (tx) => {
		const [examRow] = await tx
			.insert(examsTable)
			.values({
				title: `Prova de ${classroom.subject}`,
				description: `Gerada por IA — dificuldade ${difficulty}/10, ${questionCount} questões.`,
				totalPoints: questionCount.toFixed(2),
				status: 'draft',
				classroomId: classroom.id,
				creatorId: user.id,
			})
			.returning()

		const questions = []

		for (const [index, generated] of generatedQuestions.entries()) {
			const [questionRow] = await tx
				.insert(questionsTable)
				.values({
					examId: examRow.id,
					order: index,
					statement: generated.statement,
					type: questionType,
					maxPoints: '1.00',
				})
				.returning()

			const optionRows = await tx
				.insert(questionOptionsTable)
				.values(
					generated.options.map((option) => ({
						questionId: questionRow.id,
						letter: option.letter,
						text: option.text,
						isCorrect: option.isCorrect,
					})),
				)
				.returning()

			questions.push({
				id: questionRow.id,
				order: questionRow.order,
				statement: questionRow.statement,
				type: questionRow.type,
				maxPoints: questionRow.maxPoints,
				options: optionRows.map((option) => ({
					id: option.id,
					letter: option.letter,
					text: option.text,
					isCorrect: option.isCorrect,
				})),
			})
		}

		return {
			id: examRow.id,
			title: examRow.title,
			description: examRow.description,
			totalPoints: examRow.totalPoints,
			status: examRow.status,
			classroomId: examRow.classroomId,
			creatorId: examRow.creatorId,
			createdAt: examRow.createdAt,
			updatedAt: examRow.updatedAt,
			questions,
		}
	})

	return reply.status(201).send(exam)
}
