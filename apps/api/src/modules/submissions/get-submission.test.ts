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
import { getSubmissionPageSignedUrl } from '@/lib/storage/storage'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeSubmission } from '@/test/factories/make-submission'
import { makeSubmissionAnswer } from '@/test/factories/make-submission-answer'
import { makeSubmissionPage } from '@/test/factories/make-submission-page'

vi.mock('@/lib/storage/storage', () => ({
	getSubmissionPageSignedUrl: vi.fn(),
}))

describe('GET /submissions/:submissionId', () => {
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

	it('retorna a submissão com páginas (URL assinada) e respostas', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({ examId: exam.id })
		const page = makeSubmissionPage({ submissionId: submission.id })
		const answer = makeSubmissionAnswer({ submissionId: submission.id })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([page]) as never)
			.mockReturnValueOnce(createDbChain([answer]) as never)
		vi.mocked(getSubmissionPageSignedUrl).mockResolvedValue(
			'https://minio.local/signed-url',
		)

		const response = await app.inject({
			method: 'GET',
			url: `/submissions/${submission.id}`,
		})

		expect(response.statusCode).toBe(200)
		const body = response.json()
		expect(body.id).toBe(submission.id)
		expect(body.pages).toEqual([
			expect.objectContaining({
				id: page.id,
				imageUrl: 'https://minio.local/signed-url',
			}),
		])
		expect(body.answers).toEqual([expect.objectContaining({ id: answer.id })])
	})

	it('retorna 404 quando a submissão pertence a outro professor', async () => {
		const exam = makeExam()
		const submission = makeSubmission({ examId: exam.id })

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ submission, exam }]) as never,
		)

		const response = await app.inject({
			method: 'GET',
			url: `/submissions/${submission.id}`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 404 quando a submissão não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/submissions/${crypto.randomUUID()}`,
		})

		expect(response.statusCode).toBe(404)
	})
})
