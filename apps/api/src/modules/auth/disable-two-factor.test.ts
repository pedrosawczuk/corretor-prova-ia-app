import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/two-factor/disable', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('desabilita o 2fa do usuário autenticado', async () => {
		const password = faker.internet.password({ length: 10 })
		const responseBody = { status: true }

		vi.mocked(auth.api.disableTwoFactor).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/disable',
			payload: { password },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.disableTwoFactor).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { password },
				asResponse: true,
			}),
		)
	})

	it('retorna 401 quando a senha informada está incorreta', async () => {
		vi.mocked(auth.api.disableTwoFactor).mockResolvedValue(
			makeAuthResponse(
				{ code: 'INVALID_PASSWORD', message: 'Senha incorreta' },
				{ status: 401 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/disable',
			payload: { password: faker.internet.password({ length: 10 }) },
		})

		expect(response.statusCode).toBe(401)
	})

	it('retorna 400 quando a senha não é informada', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/disable',
			payload: {},
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.disableTwoFactor).not.toHaveBeenCalled()
	})
})
