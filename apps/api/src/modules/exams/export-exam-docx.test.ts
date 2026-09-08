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
import { assertDocxExportAllowed } from '@/modules/billing/assert-docx-export-allowed'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'

vi.mock('@/modules/billing/assert-docx-export-allowed', () => ({
	assertDocxExportAllowed: vi.fn(),
}))

describe('GET /exams/:examId/export/docx', () => {
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
		vi.mocked(assertDocxExportAllowed).mockResolvedValue(undefined)
	})

	it('retorna o DOCX da prova com status 200', async () => {
		const exam = makeExam({ creatorId: user.id })
		const question = makeQuestion({ examId: exam.id })
		const option = makeQuestionOption({ questionId: question.id })
		const headerInfo = {
			classroomName: 'Turma A',
			subjectName: 'Matemática',
			teacherName: user.name,
		}

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([question]) as never)
			.mockReturnValueOnce(createDbChain([option]) as never)
			.mockReturnValueOnce(createDbChain([headerInfo]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${exam.id}/export/docx`,
		})

		expect(response.statusCode).toBe(200)
		expect(response.headers['content-type']).toBe(
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		)
		expect(response.headers['content-disposition']).toContain('attachment')
		expect(response.rawPayload.length).toBeGreaterThan(0)
	})

	it('retorna 404 quando a prova não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${crypto.randomUUID()}/export/docx`,
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
			url: `/exams/${exam.id}/export/docx`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 400 quando o ID da prova não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/exams/id-invalido/export/docx',
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})

	it('retorna 402 quando o plano do usuário não permite exportação em DOCX', async () => {
		const exam = makeExam({ creatorId: user.id })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([exam]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
		vi.mocked(assertDocxExportAllowed).mockRejectedValue(
			new PaymentRequiredError(
				'A exportação em DOCX está disponível apenas no plano Pro.',
			),
		)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${exam.id}/export/docx`,
		})

		expect(response.statusCode).toBe(402)
	})
})
