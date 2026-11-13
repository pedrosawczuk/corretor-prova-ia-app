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
import { auth } from '@/lib/auth/auth'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { createAuthTestApp } from '@/test/create-auth-test-app'
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
		vi.mocked(auth.api.deleteUser).mockResolvedValue(
			makeAuthResponse({ success: true }) as never,
		)
	})

	it('delega exclusão de conta com senha para auth.api.deleteUser sem chamar db.delete diretamente', async () => {
		const password = faker.internet.password({ length: 12 })

		const response = await app.inject({
			method: 'POST',
			url: '/auth/delete-account',
			payload: { email: user.email, password },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			message: 'Conta deletada com sucesso.',
			requiresEmailVerification: false,
		})
		expect(auth.api.deleteUser).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({ password }),
				asResponse: true,
			}),
		)
		expect(db.delete).not.toHaveBeenCalled()
	})

	it('inicia fluxo de confirmação por e-mail quando chamado sem senha (conta OAuth)', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/delete-account',
			payload: { email: user.email },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			message: 'Enviamos um e-mail de confirmação para excluir sua conta.',
			requiresEmailVerification: true,
		})
		expect(auth.api.deleteUser).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.not.objectContaining({ password: expect.anything() }),
				asResponse: true,
			}),
		)
		expect(db.delete).not.toHaveBeenCalled()
	})

	it('repassa erro de step-up (400/403) quando auth.api.deleteUser rejeita senha inválida ou sessão antiga', async () => {
		vi.mocked(auth.api.deleteUser).mockResolvedValueOnce(
			makeAuthResponse(
				{ code: 'SESSION_EXPIRED', message: 'Session is not fresh' },
				{ status: 400 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/delete-account',
			payload: { email: user.email, password: 'wrong-password' },
		})

		expect(response.statusCode).toBe(400)
		expect(response.json()).toEqual(
			expect.objectContaining({ code: 'SESSION_EXPIRED' }),
		)
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
		expect(auth.api.deleteUser).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o e-mail enviado possui formato inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/delete-account',
			payload: { email: 'email-invalido' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.deleteUser).not.toHaveBeenCalled()
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
		expect(auth.api.deleteUser).not.toHaveBeenCalled()
	})
})
