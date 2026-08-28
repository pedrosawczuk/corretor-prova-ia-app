import { env } from '@app/env'
import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/forgot-password', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('solicita a redefinição de senha e repassa a resposta do better-auth', async () => {
		const email = faker.internet.email().toLowerCase()
		const responseBody = { status: true }

		vi.mocked(auth.api.requestPasswordReset).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/forgot-password',
			payload: { email },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.requestPasswordReset).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { email, redirectTo: `${env.WEB_URL}/redefinir-senha` },
				asResponse: true,
			}),
		)
	})

	it('retorna 400 quando o e-mail é inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/forgot-password',
			payload: { email: 'not-an-email' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.requestPasswordReset).not.toHaveBeenCalled()
	})
})
