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
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeSubmission } from '@/test/factories/make-submission'

describe('GET /exams/:examId/submissions', () => {
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

	it('lista as submissões da prova do professor autenticado', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submissions = [
			makeSubmission({ examId: exam.id }),
			makeSubmission({ examId: exam.id }),
		]

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain(submissions) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${exam.id}/submissions`,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toHaveLength(2)
	})

	it('retorna 404 quando a prova pertence a outro professor', async () => {
		const exam = makeExam()

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${exam.id}/submissions`,
		})

		expect(response.statusCode).toBe(404)
	})
})
