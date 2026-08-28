import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/two-factor/enable', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('habilita o 2fa via totp e retorna o uri e os códigos de backup', async () => {
		const password = faker.internet.password({ length: 10 })
		const responseBody = {
			method: 'totp',
			totpURI: 'otpauth://totp/gabarita.app?secret=ABC123',
			backupCodes: [
				faker.string.alphanumeric(10),
				faker.string.alphanumeric(10),
			],
		}

		vi.mocked(auth.api.enableTwoFactor).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/enable',
			payload: { password, method: 'totp' },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.enableTwoFactor).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { password, method: 'totp' },
				asResponse: true,
			}),
		)
	})

	it('usa "totp" como método padrão quando ele não é informado', async () => {
		const password = faker.internet.password({ length: 10 })

		vi.mocked(auth.api.enableTwoFactor).mockResolvedValue(
			makeAuthResponse({
				method: 'totp',
				totpURI: 'otpauth://totp/gabarita.app?secret=ABC123',
				backupCodes: [],
			}) as never,
		)

		await app.inject({
			method: 'POST',
			url: '/auth/two-factor/enable',
			payload: { password },
		})

		expect(auth.api.enableTwoFactor).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { password, method: 'totp' },
			}),
		)
	})

	it('retorna 401 quando a senha informada está incorreta', async () => {
		vi.mocked(auth.api.enableTwoFactor).mockResolvedValue(
			makeAuthResponse(
				{ code: 'INVALID_PASSWORD', message: 'Senha incorreta' },
				{ status: 401 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/enable',
			payload: { password: faker.internet.password({ length: 10 }) },
		})

		expect(response.statusCode).toBe(401)
	})

	it('retorna 400 quando os dados enviados são inválidos', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/two-factor/enable',
			payload: { password: '123' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.enableTwoFactor).not.toHaveBeenCalled()
	})
})
