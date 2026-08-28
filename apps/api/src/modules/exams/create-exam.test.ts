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
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeClassroom } from '@/test/factories/make-classroom'
import { makeCreateExamInput } from '@/test/factories/make-create-exam-input'
import { makeExam } from '@/test/factories/make-exam'

describe('POST /exams', () => {
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

	it('cria a prova em rascunho para a turma do professor autenticado e retorna 201', async () => {
		const payload = makeCreateExamInput()
		const classroom = makeClassroom({
			id: payload.classroomId,
			teacherId: user.id,
		})
		const examRow = makeExam({
			title: payload.title,
			description: payload.description,
			classroomId: classroom.id,
			creatorId: user.id,
			totalPoints: '0.00',
		})

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([classroom]) as never)
		vi.mocked(db.insert).mockReturnValue(createDbChain([examRow]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/exams',
			payload,
		})

		expect(response.statusCode).toBe(201)
		expect(response.json()).toEqual(
			expect.objectContaining({
				id: examRow.id,
				title: payload.title,
				status: 'draft',
				classroomId: classroom.id,
				questions: [],
			}),
		)
	})

	it('retorna 404 quando a turma não existe', async () => {
		const payload = makeCreateExamInput()
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/exams',
			payload,
		})

		expect(response.statusCode).toBe(404)
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a turma pertence a outro professor', async () => {
		const payload = makeCreateExamInput()
		const classroom = makeClassroom({ id: payload.classroomId })

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([classroom]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/exams',
			payload,
		})

		expect(response.statusCode).toBe(404)
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o corpo enviado é inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/exams',
			payload: { classroomId: crypto.randomUUID(), title: 'A' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
