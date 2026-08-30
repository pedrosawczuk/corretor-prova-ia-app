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
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedAdmin } from '@/test/factories/make-authenticated-admin'
import { makeSubject } from '@/test/factories/make-subject'

describe('DELETE /admin/subjects/:id', () => {
	let app: FastifyInstance
	const admin = makeAuthenticatedAdmin()

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		vi.mocked(getAuthenticatedAdmin).mockResolvedValue(admin as never)
	})

	it('exclui a disciplina quando ela não está em uso e retorna 204', async () => {
		const existing = makeSubject()

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([existing]) as never)
			.mockReturnValueOnce(createDbChain([{ total: 0 }]) as never)
		const deleteChain = createDbChain(undefined)
		vi.mocked(db.delete).mockReturnValue(deleteChain as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/admin/subjects/${existing.id}`,
		})

		expect(response.statusCode).toBe(204)
		expect(deleteChain.where).toHaveBeenCalled()
	})

	it('retorna 409 quando existem turmas usando a disciplina', async () => {
		const existing = makeSubject()

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([existing]) as never)
			.mockReturnValueOnce(createDbChain([{ total: 3 }]) as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/admin/subjects/${existing.id}`,
		})

		expect(response.statusCode).toBe(409)
		expect(db.delete).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a disciplina não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'DELETE',
			url: `/admin/subjects/${crypto.randomUUID()}`,
		})

		expect(response.statusCode).toBe(404)
		expect(db.delete).not.toHaveBeenCalled()
	})
})
