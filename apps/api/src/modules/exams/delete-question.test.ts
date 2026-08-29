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
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { examCacheKey, examListCacheKey } from './exam-cache'

describe('DELETE /exams/:examId/questions/:questionId', () => {
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

	it('exclui a questão da prova do professor autenticado e retorna 204', async () => {
		const exam = makeExam({ creatorId: user.id })
		const question = makeQuestion({ examId: exam.id })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
		const deleteChain = createDbChain(undefined)
		vi.mocked(db.delete).mockReturnValue(deleteChain as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/exams/${exam.id}/questions/${question.id}`,
		})

		expect(response.statusCode).toBe(204)
		expect(deleteChain.where).toHaveBeenCalled()
		expect(invalidateCache).toHaveBeenCalledWith(
			examCacheKey(exam.id),
			examListCacheKey(exam.classroomId),
		)
	})

	it('retorna 404 quando a prova não pertence ao professor autenticado', async () => {
		const exam = makeExam()
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/exams/${exam.id}/questions/${crypto.randomUUID()}`,
		})

		expect(response.statusCode).toBe(404)
		expect(db.delete).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a questão não pertence à prova', async () => {
		const exam = makeExam({ creatorId: user.id })
		const question = makeQuestion()

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/exams/${exam.id}/questions/${question.id}`,
		})

		expect(response.statusCode).toBe(404)
		expect(db.delete).not.toHaveBeenCalled()
	})

	it('retorna 400 quando os parâmetros de rota não são uuid válidos', async () => {
		const response = await app.inject({
			method: 'DELETE',
			url: '/exams/id-invalido/questions/id-invalido',
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
