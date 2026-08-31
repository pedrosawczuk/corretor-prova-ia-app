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
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'
import { makeSubmission } from '@/test/factories/make-submission'
import { makeSubmissionAnswer } from '@/test/factories/make-submission-answer'

describe('PATCH /submissions/:submissionId/answers/:answerId', () => {
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

	it('aplica a correção manual do professor, zera a revisão pendente e recalcula a submissão', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({ examId: exam.id })
		const question = makeQuestion({ maxPoints: '2.00' })
		const correctOption = makeQuestionOption({
			questionId: question.id,
			letter: 'B',
			isCorrect: true,
		})
		const wrongOption = makeQuestionOption({
			questionId: question.id,
			letter: 'A',
			isCorrect: false,
		})
		const answer = makeSubmissionAnswer({
			submissionId: submission.id,
			questionId: question.id,
			requiresReview: true,
		})
		const updatedAnswer = {
			...answer,
			markedOptionId: correctOption.id,
			finalScore: '2.00',
			requiresReview: false,
			reviewedBy: user.id,
		}

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([answer]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([wrongOption, correctOption]) as never)
			.mockReturnValueOnce(createDbChain([updatedAnswer]) as never)

		const tx = { update: vi.fn(), select: vi.fn() }
		tx.update.mockReturnValue(createDbChain([]))
		tx.select.mockReturnValue(createDbChain([updatedAnswer]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'PATCH',
			url: `/submissions/${submission.id}/answers/${answer.id}`,
			payload: { optionId: correctOption.id },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(
			expect.objectContaining({
				id: answer.id,
				finalScore: '2.00',
				requiresReview: false,
				reviewedBy: user.id,
			}),
		)
		expect(tx.update).toHaveBeenCalledTimes(2)
	})

	it('marca nota zero quando o professor indica que não há alternativa marcada', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({ examId: exam.id })
		const question = makeQuestion({ maxPoints: '2.00' })
		const correctOption = makeQuestionOption({
			questionId: question.id,
			letter: 'B',
			isCorrect: true,
		})
		const answer = makeSubmissionAnswer({
			submissionId: submission.id,
			questionId: question.id,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([answer]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([correctOption]) as never)
			.mockReturnValueOnce(
				createDbChain([{ ...answer, finalScore: '0.00' }]) as never,
			)

		const answerUpdateChain = createDbChain([])
		const tx = { update: vi.fn(), select: vi.fn() }
		tx.update
			.mockReturnValueOnce(answerUpdateChain)
			.mockReturnValueOnce(createDbChain([]))
		tx.select.mockReturnValue(createDbChain([answer]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'PATCH',
			url: `/submissions/${submission.id}/answers/${answer.id}`,
			payload: { optionId: null },
		})

		expect(response.statusCode).toBe(200)
		expect(answerUpdateChain.set.mock.calls[0][0]).toEqual(
			expect.objectContaining({ markedOptionId: null, finalScore: '0.00' }),
		)
	})

	it('retorna 404 quando a alternativa informada não pertence à questão', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submission = makeSubmission({ examId: exam.id })
		const question = makeQuestion()
		const answer = makeSubmissionAnswer({
			submissionId: submission.id,
			questionId: question.id,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ submission, exam }]) as never)
			.mockReturnValueOnce(createDbChain([answer]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/submissions/${submission.id}/answers/${answer.id}`,
			payload: { optionId: crypto.randomUUID() },
		})

		expect(response.statusCode).toBe(404)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a submissão pertence a outro professor', async () => {
		const exam = makeExam()
		const submission = makeSubmission({ examId: exam.id })

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ submission, exam }]) as never,
		)

		const response = await app.inject({
			method: 'PATCH',
			url: `/submissions/${submission.id}/answers/${crypto.randomUUID()}`,
			payload: { optionId: null },
		})

		expect(response.statusCode).toBe(404)
	})
})
