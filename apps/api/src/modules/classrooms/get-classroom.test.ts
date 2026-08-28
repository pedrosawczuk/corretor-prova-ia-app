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

describe('GET /classrooms/:id', () => {
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

	it('retorna 200 com a turma quando ela pertence ao professor autenticado', async () => {
		const classroom = makeClassroom({ teacherId: user.id })
		vi.mocked(db.select).mockReturnValue(createDbChain([classroom]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/classrooms/${classroom.id}`,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(
			expect.objectContaining({ id: classroom.id, name: classroom.name }),
		)
	})

	it('retorna 404 quando a turma não existe', async () => {
		vi.mocked(db.select).mockReturnValue(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/classrooms/${crypto.randomUUID()}`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 404 quando a turma pertence a outro professor', async () => {
		const classroom = makeClassroom()
		vi.mocked(db.select).mockReturnValue(createDbChain([classroom]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/classrooms/${classroom.id}`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 400 quando o id não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/classrooms/id-invalido',
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
