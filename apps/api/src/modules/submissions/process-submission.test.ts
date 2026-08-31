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
import { downloadSubmissionPage } from '@/lib/storage/storage'
import { readSubmissionAnswers } from '@/lib/vision/read-submission-answers'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'
import { makeSubmission } from '@/test/factories/make-submission'
import { makeSubmissionPage } from '@/test/factories/make-submission-page'

vi.mock('@/lib/vision/read-submission-answers', () => ({
	readSubmissionAnswers: vi.fn(),
}))

vi.mock('@/lib/storage/storage', () => ({
	downloadSubmissionPage: vi.fn(),
}))

describe('POST /submissions/:submissionId/process', () => {
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
		vi.mocked(downloadSubmissionPage).mockResolvedValue(Buffer.from('fake'))
		vi.mocked(db.update).mockReturnValue(createDbChain([]) as never)
	})

	it('corrige automaticamente as questões com confiança suficiente e deixa o resto pendente de revisão', async () => {
		const exam = makeExam({ creatorId: user.id, templatePageCount: 1 })
		const submission = makeSubmission({ examId: exam.id })
		const page = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: 1,
		})

		const questionOk = makeQuestion({
			id: 'q-ok',
			examId: exam.id,
			order: 0,
			maxPoints: '3.00',
		})
		const questionLowConfidence = makeQuestion({
			id: 'q-low',
			examId: exam.id,
			order: 1,
			maxPoints: '3.00',
		})

		const optionsOk = [
			makeQuestionOption({ questionId: 'q-ok', letter: 'A', isCorrect: false }),
			makeQuestionOption({ questionId: 'q-ok', letter: 'B', isCorrect: true }),
		]
		const optionsLow = [
			makeQuestionOption({
				questionId: 'q-low',
				letter: 'A',
				isCorrect: true,
			}),
			makeQuestionOption({
				questionId: 'q-low',
				letter: 'B',
				isCorrect: false,
			}),
		]

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([page]) as never)
			.mockReturnValueOnce(
				createDbChain([questionOk, questionLowConfidence]) as never,
			)
			.mockReturnValueOnce(
				createDbChain([...optionsOk, ...optionsLow]) as never,
			)
			.mockReturnValueOnce(
				createDbChain([{ ...submission, status: 'needs_review' }]) as never,
			)
			.mockReturnValueOnce(createDbChain([]) as never)

		vi.mocked(readSubmissionAnswers).mockResolvedValue([
			{ order: 0, detectedLetter: 'B', confidence: 0.95 },
			{ order: 1, detectedLetter: 'A', confidence: 0.4 },
		])

		const insertChain = createDbChain([])
		const updateChain = createDbChain([])
		const tx = { delete: vi.fn(), insert: vi.fn(), update: vi.fn() }
		tx.delete.mockReturnValue(createDbChain([]))
		tx.insert.mockReturnValue(insertChain)
		tx.update.mockReturnValue(updateChain)
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/process`,
		})

		expect(response.statusCode).toBe(200)
		expect(tx.delete).toHaveBeenCalledTimes(1)
		expect(tx.insert).toHaveBeenCalledTimes(1)

		const insertedRows = insertChain.values.mock.calls[0][0]
		expect(insertedRows).toEqual([
			expect.objectContaining({
				questionId: 'q-ok',
				requiresReview: false,
				aiScore: '3.00',
				finalScore: '3.00',
			}),
			expect.objectContaining({
				questionId: 'q-low',
				requiresReview: true,
				aiScore: null,
				finalScore: null,
			}),
		])

		const submissionUpdate = updateChain.set.mock.calls[0][0]
		expect(submissionUpdate).toEqual(
			expect.objectContaining({ status: 'needs_review', totalScore: '3.00' }),
		)
	})

	it('marca a submissão como falha quando a leitura por visão computacional falha', async () => {
		const exam = makeExam({ creatorId: user.id, templatePageCount: 1 })
		const submission = makeSubmission({ examId: exam.id })
		const page = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: 1,
		})
		const question = makeQuestion({ examId: exam.id, order: 0 })
		const options = [
			makeQuestionOption({ questionId: question.id, isCorrect: true }),
		]

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([page]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain(options) as never)

		vi.mocked(readSubmissionAnswers).mockRejectedValue(
			new Error('Falha ao decodificar a imagem.'),
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/process`,
		})

		expect(response.statusCode).toBe(500)
		expect(db.transaction).not.toHaveBeenCalled()
		expect(db.update).toHaveBeenCalledTimes(2)
	})

	it('retorna 400 quando a prova nunca foi exportada (gabarito não travado)', async () => {
		const exam = makeExam({ creatorId: user.id, templatePageCount: null })
		const submission = makeSubmission({ examId: exam.id })

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ submission, exam }]) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/process`,
		})

		expect(response.statusCode).toBe(400)
		expect(readSubmissionAnswers).not.toHaveBeenCalled()
	})

	it('retorna 400 quando a submissão ainda não tem nenhuma página enviada', async () => {
		const exam = makeExam({ creatorId: user.id, templatePageCount: 1 })
		const submission = makeSubmission({ examId: exam.id })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/process`,
		})

		expect(response.statusCode).toBe(400)
		expect(readSubmissionAnswers).not.toHaveBeenCalled()
	})

	it('retorna 400 quando faltam fotos de alguma página da prova', async () => {
		const exam = makeExam({ creatorId: user.id, templatePageCount: 2 })
		const submission = makeSubmission({ examId: exam.id })
		const page = makeSubmissionPage({
			submissionId: submission.id,
			pageNumber: 1,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([page]) as never)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/process`,
		})

		expect(response.statusCode).toBe(400)
		expect(response.json().message).toContain('2')
		expect(readSubmissionAnswers).not.toHaveBeenCalled()
	})

	it('retorna 409 quando a submissão já está sendo processada', async () => {
		const exam = makeExam({ creatorId: user.id, templatePageCount: 1 })
		const submission = makeSubmission({ examId: exam.id, status: 'processing' })

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ submission, exam }]) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: `/submissions/${submission.id}/process`,
		})

		expect(response.statusCode).toBe(409)
	})
})
