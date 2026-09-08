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
import { PaymentRequiredError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { assertCorrectionQuotaAvailable } from '@/modules/billing/assert-correction-quota-available'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeSubmission } from '@/test/factories/make-submission'

vi.mock('@/modules/billing/assert-correction-quota-available', () => ({
	assertCorrectionQuotaAvailable: vi.fn(),
}))

describe('POST /exams/:examId/submissions', () => {
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
		vi.mocked(assertCorrectionQuotaAvailable).mockResolvedValue(undefined)
	})

	it('cria a submissão pendente de processamento para a prova do professor autenticado e retorna 201', async () => {
		const exam = makeExam({ creatorId: user.id })
		const submissionRow = makeSubmission({
			examId: exam.id,
			studentIdentifier: 'Aluno 12',
		})

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)
		const insert = vi.fn().mockReturnValue(createDbChain([submissionRow]))
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert }) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/submissions`,
			payload: { studentIdentifier: 'Aluno 12' },
		})

		expect(response.statusCode).toBe(201)
		expect(response.json()).toEqual(
			expect.objectContaining({
				id: submissionRow.id,
				examId: exam.id,
				status: 'pending_processing',
				pages: [],
				answers: [],
			}),
		)
		expect(assertCorrectionQuotaAvailable).toHaveBeenCalledWith(
			expect.objectContaining({ insert }),
			user.id,
		)
	})

	it('retorna 404 quando a prova não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${crypto.randomUUID()}/submissions`,
			payload: {},
		})

		expect(response.statusCode).toBe(404)
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a prova pertence a outro professor', async () => {
		const exam = makeExam()

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/submissions`,
			payload: {},
		})

		expect(response.statusCode).toBe(404)
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o corpo enviado é inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: `/exams/${crypto.randomUUID()}/submissions`,
			payload: { studentIdentifier: '' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})

	it('retorna 402 quando a cota de correções do usuário está esgotada', async () => {
		const exam = makeExam({ creatorId: user.id })

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([exam]) as never)
		const insert = vi.fn()
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert }) as never,
		)
		vi.mocked(assertCorrectionQuotaAvailable).mockRejectedValue(
			new PaymentRequiredError(),
		)

		const response = await app.inject({
			method: 'POST',
			url: `/exams/${exam.id}/submissions`,
			payload: { studentIdentifier: 'Aluno 12' },
		})

		expect(response.statusCode).toBe(402)
		expect(insert).not.toHaveBeenCalled()
	})
})
