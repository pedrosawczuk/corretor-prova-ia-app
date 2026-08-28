import { db } from '@app/db'
import type { FastifyInstance } from 'fastify'
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { AiGenerationError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { generateExamQuestions } from '@/lib/gemini'
import {
	createDbChain,
	createDbTransactionMock,
} from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeClassroom } from '@/test/factories/make-classroom'
import { makeExam } from '@/test/factories/make-exam'
import { makeGenerateExamInput } from '@/test/factories/make-generate-exam-input'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'

vi.mock('@/lib/gemini', () => ({
	generateExamQuestions: vi.fn(),
}))

describe('POST /exams/generate', () => {
	let app: FastifyInstance
	const user = makeAuthenticatedUser()

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		vi.mocked(getAuthenticatedUser).mockResolvedValue(user as never)
	})

	it('gera a prova para a turma do professor autenticado e retorna 201', async () => {
		const payload = makeGenerateExamInput({
			questionCount: 1,
			questionType: 'multiple_choice',
		})
		const classroom = makeClassroom({
			id: payload.classroomId,
			teacherId: user.id,
		})

		vi.mocked(db.select).mockReturnValue(createDbChain([classroom]) as never)

		const generated = [
			{
				statement: 'Quanto é 2 + 2?',
				options: [
					{ letter: 'A', text: '3', isCorrect: false },
					{ letter: 'B', text: '4', isCorrect: true },
					{ letter: 'C', text: '5', isCorrect: false },
					{ letter: 'D', text: '6', isCorrect: false },
				],
			},
		]
		vi.mocked(generateExamQuestions).mockResolvedValue(generated as never)

		const examRow = makeExam({
			classroomId: classroom.id,
			creatorId: user.id,
			totalPoints: '1.00',
		})
		const questionRow = makeQuestion({
			examId: examRow.id,
			order: 0,
			type: 'multiple_choice',
		})
		const optionRows = generated[0].options.map((option) =>
			makeQuestionOption({ questionId: questionRow.id, ...option }),
		)

		const tx = { insert: vi.fn() }
		tx.insert
			.mockReturnValueOnce(createDbChain([examRow]))
			.mockReturnValueOnce(createDbChain([questionRow]))
			.mockReturnValueOnce(createDbChain(optionRows))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/exams/generate',
			payload,
		})

		expect(response.statusCode).toBe(201)
		expect(generateExamQuestions).toHaveBeenCalledWith({
			subject: classroom.subject,
			difficulty: payload.difficulty,
			questionCount: payload.questionCount,
			questionType: payload.questionType,
		})
		expect(tx.insert).toHaveBeenCalledTimes(3)

		const body = response.json()
		expect(body).toEqual(
			expect.objectContaining({
				id: examRow.id,
				title: examRow.title,
				status: 'draft',
				classroomId: classroom.id,
				creatorId: user.id,
			}),
		)
		expect(body.questions).toHaveLength(1)
		expect(body.questions[0]).toEqual(
			expect.objectContaining({
				id: questionRow.id,
				statement: questionRow.statement,
			}),
		)
		expect(body.questions[0].options).toHaveLength(4)
		expect(body.questions[0].options[1]).toEqual(
			expect.objectContaining({ letter: 'B', isCorrect: true }),
		)
	})

	it('retorna 404 quando a turma não existe', async () => {
		const payload = makeGenerateExamInput()
		vi.mocked(db.select).mockReturnValue(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/exams/generate',
			payload,
		})

		expect(response.statusCode).toBe(404)
		expect(generateExamQuestions).not.toHaveBeenCalled()
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a turma pertence a outro professor', async () => {
		const payload = makeGenerateExamInput()
		const classroom = makeClassroom({ id: payload.classroomId })

		vi.mocked(db.select).mockReturnValue(createDbChain([classroom]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/exams/generate',
			payload,
		})

		expect(response.statusCode).toBe(404)
		expect(generateExamQuestions).not.toHaveBeenCalled()
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('propaga um erro não 2xx quando a geração via IA falha', async () => {
		const payload = makeGenerateExamInput()
		const classroom = makeClassroom({
			id: payload.classroomId,
			teacherId: user.id,
		})

		vi.mocked(db.select).mockReturnValue(createDbChain([classroom]) as never)

		vi.mocked(generateExamQuestions).mockRejectedValue(
			new AiGenerationError('Falha ao gerar a prova com IA.'),
		)

		const response = await app.inject({
			method: 'POST',
			url: '/exams/generate',
			payload,
		})

		expect(response.statusCode).toBe(502)
		expect(response.json()).toEqual(
			expect.objectContaining({ code: 'AI_GENERATION_ERROR' }),
		)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o corpo enviado é inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/exams/generate',
			payload: {
				classroomId: crypto.randomUUID(),
				difficulty: 11,
				questionCount: 21,
				questionType: 'multiple_choice',
			},
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
		expect(generateExamQuestions).not.toHaveBeenCalled()
	})
})
