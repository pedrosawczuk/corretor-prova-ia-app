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
import { generateExamQuestions } from '@/lib/ai/gemini'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateCache } from '@/lib/cache/redis'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeClassroom } from '@/test/factories/make-classroom'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'
import { makeSubject } from '@/test/factories/make-subject'
import { examCacheKey, examListCacheKey } from './exam-cache'

vi.mock('@/lib/ai/gemini', () => ({
	generateExamQuestions: vi.fn(),
}))

describe('POST /exams/:examId/questions/:questionId/regenerate', () => {
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

	it('regera uma questão e retorna 200', async () => {
		const classroom = makeClassroom()
		const subject = makeSubject()
		const exam = makeExam({ creatorId: user.id, classroomId: classroom.id })
		const question = makeQuestion({ examId: exam.id, type: 'multiple_choice' })
		const option = makeQuestionOption()

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(
				createDbChain([{ ...classroom, subjectName: subject.name }]) as never,
			)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([option]) as never)

		vi.mocked(generateExamQuestions).mockResolvedValueOnce([
			{
				statement: 'Questão gerada via IA',
				options: [
					{ letter: 'A', text: 'Alt A', isCorrect: true },
					{ letter: 'B', text: 'Alt B', isCorrect: false },
				],
			},
		])

		const tx = { update: vi.fn(), delete: vi.fn(), insert: vi.fn() }
		const updateChain = createDbChain([])
		const deleteChain = createDbChain([])
		const insertChain = createDbChain([])
		tx.update.mockReturnValueOnce(updateChain)
		tx.delete.mockReturnValueOnce(deleteChain)
		tx.insert.mockReturnValueOnce(insertChain)

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/questions/${question.id}/regenerate`,
			payload: { difficulty: 7 },
		})

		expect(response.statusCode).toBe(200)
		expect(generateExamQuestions).toHaveBeenCalledWith({
			subject: subject.name,
			difficulty: 7,
			questionCount: 1,
			questionType: 'multiple_choice',
		})
		expect(updateChain.set).toHaveBeenCalledWith({
			statement: 'Questão gerada via IA',
		})
		expect(insertChain.values).toHaveBeenCalledWith([
			expect.objectContaining({ text: 'Alt A', isCorrect: true }),
			expect.objectContaining({ text: 'Alt B', isCorrect: false }),
		])
		expect(invalidateCache).toHaveBeenCalledWith(
			examCacheKey(exam.id),
			examListCacheKey(exam.classroomId),
		)
	})

	it('retorna 404 se a prova não for do usuário', async () => {
		const exam = makeExam()

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/questions/${crypto.randomUUID()}/regenerate`,
			payload: { difficulty: 5 },
		})

		expect(response.statusCode).toBe(404)
	})
})
