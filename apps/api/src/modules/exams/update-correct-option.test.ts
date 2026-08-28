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
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import {
	createDbChain,
	createDbTransactionMock,
} from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'

describe('PATCH /exams/:examId/questions/:questionId/correct-option', () => {
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

	it('atualiza a alternativa correta e retorna 200', async () => {
		const exam = makeExam({ creatorId: user.id })
		const question = makeQuestion({ examId: exam.id })
		const optionA = makeQuestionOption({
			questionId: question.id,
			letter: 'A',
			isCorrect: true,
		})
		const optionB = makeQuestionOption({
			questionId: question.id,
			letter: 'B',
			isCorrect: false,
		})
		const updatedOptions = [
			{ ...optionA, isCorrect: false },
			{ ...optionB, isCorrect: true },
		]

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([optionB]) as never)
			.mockReturnValueOnce(createDbChain(updatedOptions) as never)

		const tx = { update: vi.fn() }
		const updateAllChain = createDbChain([])
		const updateOneChain = createDbChain([])
		tx.update
			.mockReturnValueOnce(updateAllChain)
			.mockReturnValueOnce(updateOneChain)

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'PATCH',
			url: `/exams/${exam.id}/questions/${question.id}/correct-option`,
			payload: { optionId: optionB.id },
		})

		expect(response.statusCode).toBe(200)
		expect(updateAllChain.set).toHaveBeenCalledWith({ isCorrect: false })
		expect(updateOneChain.set).toHaveBeenCalledWith({ isCorrect: true })
		expect(response.json()).toEqual(
			expect.objectContaining({
				id: question.id,
				statement: question.statement,
			}),
		)
		expect(response.json().options).toHaveLength(2)
	})

	it('retorna 404 quando a prova não pertence ao professor autenticado', async () => {
		const exam = makeExam()

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/exams/${exam.id}/questions/${crypto.randomUUID()}/correct-option`,
			payload: { optionId: crypto.randomUUID() },
		})

		expect(response.statusCode).toBe(404)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a questão não pertence à prova', async () => {
		const exam = makeExam({ creatorId: user.id })
		const question = makeQuestion()

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/exams/${exam.id}/questions/${question.id}/correct-option`,
			payload: { optionId: crypto.randomUUID() },
		})

		expect(response.statusCode).toBe(404)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a alternativa não pertence à questão', async () => {
		const exam = makeExam({ creatorId: user.id })
		const question = makeQuestion({ examId: exam.id })
		const option = makeQuestionOption()

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([option]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/exams/${exam.id}/questions/${question.id}/correct-option`,
			payload: { optionId: option.id },
		})

		expect(response.statusCode).toBe(404)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('retorna 400 quando os parâmetros de rota não são uuid válidos', async () => {
		const response = await app.inject({
			method: 'PATCH',
			url: '/exams/id-invalido/questions/id-invalido/correct-option',
			payload: { optionId: crypto.randomUUID() },
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o optionId enviado não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'PATCH',
			url: `/exams/${crypto.randomUUID()}/questions/${crypto.randomUUID()}/correct-option`,
			payload: { optionId: 'id-invalido' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
