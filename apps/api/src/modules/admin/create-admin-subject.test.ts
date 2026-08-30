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
import { makeSubjectInput } from '@/test/factories/make-subject-input'

describe('POST /admin/subjects', () => {
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

	it('cria a disciplina e retorna 201 quando o nome ainda não existe', async () => {
		const payload = makeSubjectInput()
		const created = makeSubject(payload)

		vi.mocked(db.select).mockReturnValue(createDbChain([]) as never)
		const insertChain = createDbChain([created])
		vi.mocked(db.insert).mockReturnValue(insertChain as never)

		const response = await app.inject({
			method: 'POST',
			url: '/admin/subjects',
			payload,
		})

		expect(response.statusCode).toBe(201)
		expect(insertChain.values).toHaveBeenCalledWith({ name: payload.name })
		expect(response.json()).toEqual(
			expect.objectContaining({ id: created.id, name: payload.name }),
		)
	})

	it('retorna 409 quando já existe uma disciplina com o mesmo nome', async () => {
		const payload = makeSubjectInput()
		const existing = makeSubject({ name: payload.name })

		vi.mocked(db.select).mockReturnValue(createDbChain([existing]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/admin/subjects',
			payload,
		})

		expect(response.statusCode).toBe(409)
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('retorna 400 quando os dados enviados são inválidos', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/admin/subjects',
			payload: { name: 'A' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('retorna 403 quando o usuário não é administrador', async () => {
		vi.mocked(getAuthenticatedAdmin).mockRejectedValue(
			new ForbiddenError('Acesso restrito a administradores.'),
		)

		const response = await app.inject({
			method: 'POST',
			url: '/admin/subjects',
			payload: makeSubjectInput(),
		})

		expect(response.statusCode).toBe(403)
		expect(db.insert).not.toHaveBeenCalled()
	})
})
