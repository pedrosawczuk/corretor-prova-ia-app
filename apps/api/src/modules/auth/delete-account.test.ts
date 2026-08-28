import { db } from '@app/db'
import { faker } from '@faker-js/faker'
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
import { UnauthorizedError } from '@/core/errors'
import { auth } from '@/lib/auth'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { createDbChain } from '@/test/create-db-chain'
import { makeAuthResponse } from '@/test/factories/make-auth-response'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'

describe('POST /auth/delete-account', () => {
	let app: FastifyInstance
	const user = makeAuthenticatedUser()

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		vi.mocked(getAuthenticatedUser).mockResolvedValue(user as never)
		const deleteChain = createDbChain(undefined)
		vi.mocked(db.delete).mockReturnValue(deleteChain as never)
		vi.mocked(auth.api.signOut).mockResolvedValue(
			makeAuthResponse({ success: true }) as never,
		)
	})

	it('exclui a conta do usuário quando o e-mail digitado coincide', async () => {
		const deleteChain = createDbChain(undefined)
		vi.mocked(db.delete).mockReturnValue(deleteChain as never)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/delete-account',
			payload: { email: user.email },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({ message: 'Conta deletada com sucesso.' })
		expect(db.delete).toHaveBeenCalled()
		expect(deleteChain.where).toHaveBeenCalled()
		expect(auth.api.signOut).toHaveBeenCalled()
	})

	it('retorna 400 quando o e-mail digitado não coincide com o do usuário', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/delete-account',
			payload: { email: faker.internet.email() },
		})

		expect(response.statusCode).toBe(400)
		expect(response.json()).toEqual(
			expect.objectContaining({
				message: 'O e-mail digitado não corresponde ao seu e-mail de cadastro.',
			}),
		)
		expect(db.delete).not.toHaveBeenCalled()
		expect(auth.api.signOut).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o e-mail enviado possui formato inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/delete-account',
			payload: { email: 'email-invalido' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.delete).not.toHaveBeenCalled()
		expect(auth.api.signOut).not.toHaveBeenCalled()
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(
			new UnauthorizedError('Você precisa estar autenticado para continuar.'),
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/delete-account',
			payload: { email: user.email },
		})

		expect(response.statusCode).toBe(401)
		expect(db.delete).not.toHaveBeenCalled()
		expect(auth.api.signOut).not.toHaveBeenCalled()
	})
})
