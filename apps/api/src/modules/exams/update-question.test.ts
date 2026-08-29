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
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateCache } from '@/lib/cache/redis'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'
import { examCacheKey, examListCacheKey } from './exam-cache'

describe('PATCH /exams/:examId/questions/:questionId', () => {
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

	it('atualiza o texto da questão e alternativas e retorna 200', async () => {
		const exam = makeExam({ creatorId: user.id })
		const question = makeQuestion({ examId: exam.id })
		const optionA = makeQuestionOption({ questionId: question.id, letter: 'A' })
		const optionB = makeQuestionOption({ questionId: question.id, letter: 'B' })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([optionA, optionB]) as never)

		const tx = { update: vi.fn() }
		const updateStatementChain = createDbChain([])
		const updateOptionAChain = createDbChain([])
		const updateOptionBChain = createDbChain([])
		tx.update
			.mockReturnValueOnce(updateStatementChain)
			.mockReturnValueOnce(updateOptionAChain)
			.mockReturnValueOnce(updateOptionBChain)

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'PATCH',
			url: `/exams/${exam.id}/questions/${question.id}`,
			payload: {
				statement: 'Novo enunciado',
				options: [
					{ id: optionA.id, text: 'Nova A' },
					{ id: optionB.id, text: 'Nova B' },
				],
			},
		})

		expect(response.statusCode).toBe(200)
		expect(updateStatementChain.set).toHaveBeenCalledWith({
			statement: 'Novo enunciado',
		})
		expect(updateOptionAChain.set).toHaveBeenCalledWith({ text: 'Nova A' })
		expect(updateOptionBChain.set).toHaveBeenCalledWith({ text: 'Nova B' })
		expect(response.json().statement).toBe('Novo enunciado')
		expect(invalidateCache).toHaveBeenCalledWith(
			examCacheKey(exam.id),
			examListCacheKey(exam.classroomId),
		)
	})

	it('retorna 404 se a prova não for do usuário', async () => {
		const exam = makeExam()

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/exams/${exam.id}/questions/${crypto.randomUUID()}`,
			payload: {
				statement: 'Novo enunciado',
				options: [
					{ id: crypto.randomUUID(), text: 'Nova A' },
					{ id: crypto.randomUUID(), text: 'Nova B' },
				],
			},
		})

		expect(response.statusCode).toBe(404)
	})
})
