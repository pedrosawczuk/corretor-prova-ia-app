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
import { uploadExamTemplate } from '@/lib/storage/storage'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'

vi.mock('@/lib/storage/storage', () => ({
	uploadExamTemplate: vi.fn().mockResolvedValue('exam-templates/fake.pdf'),
}))

describe('GET /exams/:examId/export/pdf', () => {
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

	it('retorna o PDF da prova com status 200 e trava o gabarito de correção', async () => {
		const exam = makeExam({ creatorId: user.id, templateLockedAt: null })
		const question = makeQuestion({ examId: exam.id })
		const option = makeQuestionOption({
			questionId: question.id,
			letter: 'A',
		})
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

		const tx = { update: vi.fn() }
		tx.update.mockReturnValue(createDbChain([]))
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${exam.id}/export/pdf`,
		})

		expect(response.statusCode).toBe(200)
		expect(response.headers['content-type']).toBe('application/pdf')
		expect(response.headers['content-disposition']).toContain('attachment')
		expect(response.rawPayload.length).toBeGreaterThan(0)
		expect(uploadExamTemplate).toHaveBeenCalledWith(exam.id, expect.any(Buffer))
		// 1 alternativa (question_options) + 1 atualização da prova (exams)
		expect(tx.update).toHaveBeenCalledTimes(2)
	})

	it('reaproveita o PDF sem travar de novo quando o gabarito já está travado', async () => {
		const exam = makeExam({
			creatorId: user.id,
			templateLockedAt: new Date('2026-01-01'),
			updatedAt: new Date('2025-12-01'),
		})
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
			url: `/exams/${exam.id}/export/pdf`,
		})

		expect(response.statusCode).toBe(200)
		expect(uploadExamTemplate).not.toHaveBeenCalled()
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a prova não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams/${crypto.randomUUID()}/export/pdf`,
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
			url: `/exams/${exam.id}/export/pdf`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 400 quando o ID da prova não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/exams/id-invalido/export/pdf',
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
