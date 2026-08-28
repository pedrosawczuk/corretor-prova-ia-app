import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/two-factor/verify-otp', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('verifica o código otp e repassa o cookie de sessão', async () => {
		const code = faker.string.numeric(6)
		const responseBody = {
			token: faker.string.uuid(),
			user: { id: faker.string.uuid() },
		}

		vi.mocked(auth.api.verifyTwoFactorOTP).mockResolvedValue(
			makeAuthResponse(responseBody, {
				headers: {
					'set-cookie': 'better-auth.session=abc123; Path=/; HttpOnly',
				},
			}) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/verify-otp',
			payload: { code },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(response.cookies).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'better-auth.session' }),
			]),
		)
		expect(auth.api.verifyTwoFactorOTP).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { code, trustDevice: undefined },
				asResponse: true,
			}),
		)
	})

	it('retorna 401 quando o código informado é inválido ou expirado', async () => {
		vi.mocked(auth.api.verifyTwoFactorOTP).mockResolvedValue(
			makeAuthResponse(
				{ code: 'OTP_HAS_EXPIRED', message: 'Código expirado' },
				{ status: 401 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/verify-otp',
			payload: { code: faker.string.numeric(6) },
		})

		expect(response.statusCode).toBe(401)
	})

	it('retorna 400 quando o código não é informado', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/verify-otp',
			payload: {},
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.verifyTwoFactorOTP).not.toHaveBeenCalled()
	})
})
