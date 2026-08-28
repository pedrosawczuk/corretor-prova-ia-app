import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/reset-password', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('redefine a senha com um token válido', async () => {
		const payload = {
			token: faker.string.alphanumeric(32),
			password: faker.internet.password({ length: 10 }),
		}
		const responseBody = { status: true }

		vi.mocked(auth.api.resetPassword).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/reset-password',
			payload,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.resetPassword).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { newPassword: payload.password, token: payload.token },
				asResponse: true,
			}),
		)
	})

	it('retorna 400 quando o token é inválido ou expirado', async () => {
		vi.mocked(auth.api.resetPassword).mockResolvedValue(
			makeAuthResponse(
				{ code: 'INVALID_TOKEN', message: 'Token inválido ou expirado' },
				{ status: 400 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/reset-password',
			payload: {
				token: faker.string.alphanumeric(32),
				password: faker.internet.password({ length: 10 }),
			},
		})

		expect(response.statusCode).toBe(400)
	})

	it('retorna 400 quando os dados enviados são inválidos', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/reset-password',
			payload: { token: '', password: '123' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.resetPassword).not.toHaveBeenCalled()
	})
})
