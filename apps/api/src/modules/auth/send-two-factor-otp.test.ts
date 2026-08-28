import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/two-factor/send-otp', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('envia o código otp por e-mail para o desafio de 2fa em andamento', async () => {
		const responseBody = { status: true }

		vi.mocked(auth.api.sendTwoFactorOTP).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/send-otp',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.sendTwoFactorOTP).toHaveBeenCalledWith(
			expect.objectContaining({ asResponse: true }),
		)
	})

	it('retorna 401 quando não há um desafio de 2fa válido em andamento', async () => {
		vi.mocked(auth.api.sendTwoFactorOTP).mockResolvedValue(
			makeAuthResponse(
				{
					code: 'INVALID_TWO_FACTOR_COOKIE',
					message: 'Sessão de 2fa inválida',
				},
				{ status: 401 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/send-otp',
		})

		expect(response.statusCode).toBe(401)
	})
})
