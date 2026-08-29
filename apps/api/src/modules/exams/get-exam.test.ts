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
import { getOrSetCache } from '@/lib/cache/redis'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'

describe('GET /exams/:examId', () => {
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

	it('retorna a prova com as questões e alternativas e status 200', async () => {
		const exam = makeExam({ creatorId: user.id })
		const question = makeQuestion({ examId: exam.id })
		const option = makeQuestionOption({ questionId: question.id })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([option]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${exam.id}`,
		})

		expect(response.statusCode).toBe(200)
		const body = response.json()
		expect(body).toEqual(expect.objectContaining({ id: exam.id }))
		expect(body.questions).toHaveLength(1)
		expect(body.questions[0].options).toHaveLength(1)
	})

	it('retorna a prova do cache sem consultar o banco quando há valor em cache', async () => {
		const exam = makeExam({ creatorId: user.id })
		vi.mocked(getOrSetCache).mockResolvedValueOnce({ ...exam, questions: [] })

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${exam.id}`,
		})

		expect(response.statusCode).toBe(200)
		expect(db.select).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a prova não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${crypto.randomUUID()}`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 404 quando a prova pertence a outro professor', async () => {
		const exam = makeExam()
		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${exam.id}`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 400 quando o ID da prova não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/exams/id-invalido',
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
