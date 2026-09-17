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
import {
	deleteSubmissionPage,
	getSubmissionPageSignedUrl,
} from '@/lib/storage/storage'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeSubmission } from '@/test/factories/make-submission'
import { makeSubmissionPage } from '@/test/factories/make-submission-page'

vi.mock('@/lib/storage/storage', () => ({
	deleteSubmissionPage: vi.fn(),
	getSubmissionPageSignedUrl: vi.fn(),
}))

describe('DELETE /submissions/:submissionId/pages/:pageId', () => {
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
		vi.mocked(deleteSubmissionPage).mockResolvedValue(undefined)
		vi.mocked(getSubmissionPageSignedUrl).mockResolvedValue(
			'https://minio.local/signed-url',
		)
	})

	it('remove a página e renumera as páginas restantes sequencialmente', async () => {
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
		const pageThree = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: 3,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([pageTwo]) as never)
			.mockReturnValueOnce(
				createDbChain([
					{ ...pageOne, pageNumber: 1 },
					{ ...pageThree, pageNumber: 2 },
				]) as never,
			)

		const deleteChain = createDbChain([])
		const updateChain = createDbChain([])
		const tx = {
			delete: vi.fn().mockReturnValue(deleteChain),
			select: vi
				.fn()
				.mockReturnValue(
					createDbChain([pageOne, { ...pageThree, pageNumber: 3 }]),
				),
			update: vi.fn().mockReturnValue(updateChain),
		}
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'DELETE',
			url: `/submissions/${submission.id}/pages/${pageTwo.id}`,
		})

		expect(response.statusCode).toBe(200)
		expect(tx.delete).toHaveBeenCalledTimes(1)
		expect(deleteSubmissionPage).toHaveBeenCalledWith(pageTwo.imageUrl)
		expect(tx.update).toHaveBeenCalledTimes(1)
		expect(updateChain.set).toHaveBeenCalledWith({ pageNumber: 2 })

		const body = response.json()
		expect(body).toEqual([
			expect.objectContaining({ id: pageOne.id, pageNumber: 1 }),
			expect.objectContaining({ id: pageThree.id, pageNumber: 2 }),
		])
	})

	it('retorna 404 quando a página não pertence à submissão', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({
			examId: exam.id,
			status: 'pending_processing',
		})
		const foreignPage = makeSubmissionPage({
			submissionId: 'outra-submissao',
			pageNumber: 1,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([foreignPage]) as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/submissions/${submission.id}/pages/${foreignPage.id}`,
		})

		expect(response.statusCode).toBe(404)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('bloqueia com 409 quando a submissão já está em processamento', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({ examId: exam.id, status: 'processing' })
		const page = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: 1,
		})

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ submission, exam }]) as never,
		)

		const response = await app.inject({
			method: 'DELETE',
			url: `/submissions/${submission.id}/pages/${page.id}`,
		})

		expect(response.statusCode).toBe(409)
		expect(db.transaction).not.toHaveBeenCalled()
	})
})
