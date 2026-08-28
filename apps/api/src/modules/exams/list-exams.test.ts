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
import { makeExam } from '@/test/factories/make-exam'

describe('GET /exams', () => {
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

	it('lista as provas da turma do professor autenticado e retorna 200', async () => {
		const classroom = makeClassroom({ teacherId: user.id })
		const examA = makeExam({ classroomId: classroom.id, creatorId: user.id })
		const examB = makeExam({ classroomId: classroom.id, creatorId: user.id })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([classroom]) as never)
			.mockReturnValueOnce(createDbChain([examA, examB]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams?classroomId=${classroom.id}`,
		})

		expect(response.statusCode).toBe(200)
		const body = response.json()
		expect(body).toHaveLength(2)
		expect(body[0]).toEqual(expect.objectContaining({ id: examA.id, questions: [] }))
	})

	it('retorna 404 quando a turma não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams?classroomId=${crypto.randomUUID()}`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 404 quando a turma pertence a outro professor', async () => {
		const classroom = makeClassroom()
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([classroom]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/exams?classroomId=${classroom.id}`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 400 quando classroomId não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/exams?classroomId=id-invalido',
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
