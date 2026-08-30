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
import { generateExamQuestions } from '@/lib/ai/gemini'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateCache } from '@/lib/cache/redis'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeClassroom } from '@/test/factories/make-classroom'
import { makeExam } from '@/test/factories/make-exam'
import { makeGenerateExamInput } from '@/test/factories/make-generate-exam-input'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'
import { makeSubject } from '@/test/factories/make-subject'
import { examCacheKey, examListCacheKey } from './exam-cache'

vi.mock('@/lib/ai/gemini', () => ({
	generateExamQuestions: vi.fn(),
}))

describe('POST /exams/:examId/generate', () => {
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

	it('gera as questões para a prova do professor autenticado e retorna 200', async () => {
		const payload = makeGenerateExamInput({
			questionCount: 1,
			questionType: 'multiple_choice',
		})
		const exam = makeExam({ creatorId: user.id })
		const classroom = makeClassroom({
			id: exam.classroomId,
			teacherId: user.id,
		})
		const subject = makeSubject()

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

		const questionRow = makeQuestion({
			examId: exam.id,
			order: 0,
			type: 'multiple_choice',
		})
		const optionRows = generated[0].options.map((option) =>
			makeQuestionOption({ questionId: questionRow.id, ...option }),
		)
		const updatedExam = { ...exam, totalPoints: '1.00' }

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(
				createDbChain([{ ...classroom, subjectName: subject.name }]) as never,
			)
			.mockReturnValueOnce(createDbChain([updatedExam]) as never)
			.mockReturnValueOnce(createDbChain([questionRow]) as never)
			.mockReturnValueOnce(createDbChain(optionRows) as never)

		const tx = { delete: vi.fn(), insert: vi.fn(), update: vi.fn() }
		tx.delete.mockReturnValue(createDbChain([]))
		tx.insert
			.mockReturnValueOnce(createDbChain([questionRow]))
			.mockReturnValueOnce(createDbChain(optionRows))
		tx.update.mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/generate`,
			payload,
		})

		expect(response.statusCode).toBe(200)
		expect(generateExamQuestions).toHaveBeenCalledWith({
			subject: subject.name,
			topic: payload.topic,
			difficulty: payload.difficulty,
			questionCount: payload.questionCount,
			questionType: payload.questionType,
		})
		expect(tx.delete).toHaveBeenCalledTimes(1)
		expect(tx.insert).toHaveBeenCalledTimes(2)
		expect(tx.update).toHaveBeenCalledTimes(1)

		const body = response.json()
		expect(body).toEqual(
			expect.objectContaining({ id: exam.id, totalPoints: '1.00' }),
		)
		expect(body.questions).toHaveLength(1)
		expect(body.questions[0].options).toHaveLength(4)
		expect(body.questions[0].options[1]).toEqual(
			expect.objectContaining({ letter: 'B', isCorrect: true }),
		)
		expect(invalidateCache).toHaveBeenCalledWith(
			examCacheKey(exam.id),
			examListCacheKey(exam.classroomId),
		)
	})

	it('gera uma prova mista combinando múltipla escolha e verdadeiro/falso', async () => {
		const payload = makeGenerateExamInput({
			questionType: 'mixed',
			questionCount: 2,
			multipleChoiceCount: 1,
		})
		const exam = makeExam({ creatorId: user.id })
		const classroom = makeClassroom({
			id: exam.classroomId,
			teacherId: user.id,
		})
		const subject = makeSubject()

		const mcGenerated = [
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
		const tfGenerated = [
			{
				statement: 'A Terra é redonda.',
				options: [
					{ letter: 'V', text: 'Verdadeiro', isCorrect: true },
					{ letter: 'F', text: 'Falso', isCorrect: false },
				],
			},
		]
		vi.mocked(generateExamQuestions)
			.mockResolvedValueOnce(mcGenerated as never)
			.mockResolvedValueOnce(tfGenerated as never)

		const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

		const tfQuestionRow = makeQuestion({
			examId: exam.id,
			order: 0,
			type: 'true_false',
		})
		const mcQuestionRow = makeQuestion({
			examId: exam.id,
			order: 1,
			type: 'multiple_choice',
		})
		const tfOptionRows = tfGenerated[0].options.map((option) =>
			makeQuestionOption({ questionId: tfQuestionRow.id, ...option }),
		)
		const mcOptionRows = mcGenerated[0].options.map((option) =>
			makeQuestionOption({ questionId: mcQuestionRow.id, ...option }),
		)
		const updatedExam = { ...exam, totalPoints: '2.00' }

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(
				createDbChain([{ ...classroom, subjectName: subject.name }]) as never,
			)
			.mockReturnValueOnce(createDbChain([updatedExam]) as never)
			.mockReturnValueOnce(
				createDbChain([tfQuestionRow, mcQuestionRow]) as never,
			)
			.mockReturnValueOnce(
				createDbChain([...tfOptionRows, ...mcOptionRows]) as never,
			)

		const tx = { delete: vi.fn(), insert: vi.fn(), update: vi.fn() }
		tx.delete.mockReturnValue(createDbChain([]))
		tx.insert
			.mockReturnValueOnce(createDbChain([tfQuestionRow]))
			.mockReturnValueOnce(createDbChain(tfOptionRows))
			.mockReturnValueOnce(createDbChain([mcQuestionRow]))
			.mockReturnValueOnce(createDbChain(mcOptionRows))
		tx.update.mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/generate`,
			payload,
		})

		randomSpy.mockRestore()

		expect(response.statusCode).toBe(200)
		expect(generateExamQuestions).toHaveBeenCalledWith({
			subject: subject.name,
			topic: payload.topic,
			difficulty: payload.difficulty,
			questionCount: 1,
			questionType: 'multiple_choice',
		})
		expect(generateExamQuestions).toHaveBeenCalledWith({
			subject: subject.name,
			topic: payload.topic,
			difficulty: payload.difficulty,
			questionCount: 1,
			questionType: 'true_false',
		})
		expect(tx.insert).toHaveBeenCalledTimes(4)

		const body = response.json()
		expect(body).toEqual(
			expect.objectContaining({ id: exam.id, totalPoints: '2.00' }),
		)
		expect(body.questions).toHaveLength(2)
	})

	it('retorna 400 quando a prova mista não informa a quantidade de múltipla escolha', async () => {
		const response = await app.inject({
			method: 'POST',
			url: `/exams/${crypto.randomUUID()}/generate`,
			payload: {
				difficulty: 5,
				questionCount: 10,
				questionType: 'mixed',
			},
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
		expect(generateExamQuestions).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a prova não existe', async () => {
		const payload = makeGenerateExamInput()
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${crypto.randomUUID()}/generate`,
			payload,
		})

		expect(response.statusCode).toBe(404)
		expect(generateExamQuestions).not.toHaveBeenCalled()
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a prova pertence a outro professor', async () => {
		const payload = makeGenerateExamInput()
		const exam = makeExam()

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/generate`,
			payload,
		})

		expect(response.statusCode).toBe(404)
		expect(generateExamQuestions).not.toHaveBeenCalled()
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('propaga um erro não 2xx quando a geração via IA falha', async () => {
		const payload = makeGenerateExamInput()
		const exam = makeExam({ creatorId: user.id })
		const classroom = makeClassroom({ id: exam.classroomId })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([classroom]) as never)

		vi.mocked(generateExamQuestions).mockRejectedValue(
			new AiGenerationError('Falha ao gerar a prova com IA.'),
		)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/generate`,
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
			url: `/exams/${crypto.randomUUID()}/generate`,
			payload: {
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
