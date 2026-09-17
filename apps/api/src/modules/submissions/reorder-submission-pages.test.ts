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
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeSubmission } from '@/test/factories/make-submission'
import { makeSubmissionPage } from '@/test/factories/make-submission-page'

vi.mock('@/lib/storage/storage', () => ({
	getSubmissionPageSignedUrl: vi.fn(),
}))

describe('PATCH /submissions/:submissionId/pages/reorder', () => {
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
		vi.mocked(getSubmissionPageSignedUrl).mockResolvedValue(
			'https://minio.local/signed-url',
		)
	})

	it('reordena as páginas de acordo com a nova ordem enviada', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({
			examId: exam.id,
			status: 'pending_processing',
		})
		const pageOne = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: 1,
		})
		const pageTwo = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: 2,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([pageOne, pageTwo]) as never)
			.mockReturnValueOnce(
				createDbChain([
					{ ...pageTwo, pageNumber: 1 },
					{ ...pageOne, pageNumber: 2 },
				]) as never,
			)

		const updateChain = createDbChain([])
		const tx = { update: vi.fn().mockReturnValue(updateChain) }
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'PATCH',
			url: `/submissions/${submission.id}/pages/reorder`,
			payload: { pageIds: [pageTwo.id, pageOne.id] },
		})

		expect(response.statusCode).toBe(200)
		expect(tx.update).toHaveBeenCalledTimes(2)
		expect(updateChain.set).toHaveBeenNthCalledWith(1, { pageNumber: 1 })
		expect(updateChain.set).toHaveBeenNthCalledWith(2, { pageNumber: 2 })

		const body = response.json()
		expect(body).toEqual([
			expect.objectContaining({ id: pageTwo.id, pageNumber: 1 }),
			expect.objectContaining({ id: pageOne.id, pageNumber: 2 }),
		])
	})

	it('rejeita com 400 quando a nova ordem não bate com as páginas existentes', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({
			examId: exam.id,
			status: 'pending_processing',
		})
		const pageOne = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: 1,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([pageOne]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/submissions/${submission.id}/pages/reorder`,
			payload: { pageIds: ['00000000-0000-0000-0000-000000000000'] },
		})

		expect(response.statusCode).toBe(400)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('bloqueia com 409 quando a submissão já foi concluída', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({ examId: exam.id, status: 'completed' })

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ submission, exam }]) as never,
		)

		const response = await app.inject({
			method: 'PATCH',
			url: `/submissions/${submission.id}/pages/reorder`,
			payload: { pageIds: ['00000000-0000-0000-0000-000000000000'] },
		})

		expect(response.statusCode).toBe(409)
		expect(db.transaction).not.toHaveBeenCalled()
	})
})
