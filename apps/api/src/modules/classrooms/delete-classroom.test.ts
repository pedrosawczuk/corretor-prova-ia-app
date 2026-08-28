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

describe('DELETE /classrooms/:id', () => {
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

	it('exclui a turma quando ela pertence ao professor autenticado e retorna 204', async () => {
		const existing = makeClassroom({ teacherId: user.id })
		vi.mocked(db.select).mockReturnValue(createDbChain([existing]) as never)
		const deleteChain = createDbChain(undefined)
		vi.mocked(db.delete).mockReturnValue(deleteChain as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/classrooms/${existing.id}`,
		})

		expect(response.statusCode).toBe(204)
		expect(deleteChain.where).toHaveBeenCalled()
	})

	it('retorna 404 quando a turma não existe', async () => {
		vi.mocked(db.select).mockReturnValue(createDbChain([]) as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/classrooms/${crypto.randomUUID()}`,
		})

		expect(response.statusCode).toBe(404)
		expect(db.delete).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a turma pertence a outro professor', async () => {
		const existing = makeClassroom()
		vi.mocked(db.select).mockReturnValue(createDbChain([existing]) as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/classrooms/${existing.id}`,
		})

		expect(response.statusCode).toBe(404)
		expect(db.delete).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o id não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'DELETE',
			url: '/classrooms/id-invalido',
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
