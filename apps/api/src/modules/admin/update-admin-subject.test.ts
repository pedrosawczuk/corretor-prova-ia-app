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
import { makeSubjectInput } from '@/test/factories/make-subject-input'

describe('PATCH /admin/subjects/:id', () => {
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

	it('atualiza a disciplina e retorna 200 quando o nome não conflita', async () => {
		const existing = makeSubject()
		const payload = makeSubjectInput()
		const updated = makeSubject({ ...existing, ...payload })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([existing]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
		const updateChain = createDbChain([updated])
		vi.mocked(db.update).mockReturnValue(updateChain as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/admin/subjects/${existing.id}`,
			payload,
		})

		expect(response.statusCode).toBe(200)
		expect(updateChain.set).toHaveBeenCalledWith(
			expect.objectContaining({
				name: payload.name,
				updatedAt: expect.any(Date),
			}),
		)
	})

	it('retorna 404 quando a disciplina não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/admin/subjects/${crypto.randomUUID()}`,
			payload: makeSubjectInput(),
		})

		expect(response.statusCode).toBe(404)
		expect(db.update).not.toHaveBeenCalled()
	})

	it('retorna 409 quando o novo nome já pertence a outra disciplina', async () => {
		const existing = makeSubject()
		const other = makeSubject()
		const payload = makeSubjectInput({ name: other.name })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([existing]) as never)
			.mockReturnValueOnce(createDbChain([other]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/admin/subjects/${existing.id}`,
			payload,
		})

		expect(response.statusCode).toBe(409)
		expect(db.update).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o id não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'PATCH',
			url: '/admin/subjects/id-invalido',
			payload: makeSubjectInput(),
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
