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
import { ForbiddenError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedAdmin } from '@/test/factories/make-authenticated-admin'
import { makeSubject } from '@/test/factories/make-subject'

describe('GET /admin/subjects', () => {
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

	it('retorna 200 com as disciplinas paginadas para o admin autenticado', async () => {
		const subjects = [makeSubject(), makeSubject()]
		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([{ total: subjects.length }]) as never)
			.mockReturnValueOnce(createDbChain(subjects) as never)

		const response = await app.inject({ method: 'GET', url: '/admin/subjects' })

		expect(response.statusCode).toBe(200)
		const body = response.json()
		expect(body.data).toHaveLength(2)
		expect(body.pagination).toEqual({
			page: 1,
			pageSize: 20,
			total: 2,
			totalPages: 1,
		})
	})

	it('retorna 403 quando o usuário não é administrador', async () => {
		vi.mocked(getAuthenticatedAdmin).mockRejectedValue(
			new ForbiddenError('Acesso restrito a administradores.'),
		)

		const response = await app.inject({ method: 'GET', url: '/admin/subjects' })

		expect(response.statusCode).toBe(403)
		expect(db.select).not.toHaveBeenCalled()
	})
})
