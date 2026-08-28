import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/update-password', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('atualiza a senha do usuário autenticado', async () => {
		const payload = {
			currentPassword: faker.internet.password({ length: 10 }),
			newPassword: faker.internet.password({ length: 10 }),
		}
		const responseBody = { status: true }

		vi.mocked(auth.api.changePassword).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/update-password',
			payload,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.changePassword).toHaveBeenCalledWith(
			expect.objectContaining({
				body: {
					currentPassword: payload.currentPassword,
					newPassword: payload.newPassword,
					revokeOtherSessions: true,
				},
				asResponse: true,
			}),
		)
	})

	it('retorna 401 quando a senha atual está incorreta', async () => {
		vi.mocked(auth.api.changePassword).mockResolvedValue(
			makeAuthResponse(
				{ code: 'INVALID_PASSWORD', message: 'Senha atual incorreta' },
				{ status: 401 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/update-password',
			payload: {
				currentPassword: faker.internet.password({ length: 10 }),
				newPassword: faker.internet.password({ length: 10 }),
			},
		})

		expect(response.statusCode).toBe(401)
	})

	it('retorna 400 quando os dados enviados são inválidos', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/update-password',
			payload: { currentPassword: '123', newPassword: '123' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.changePassword).not.toHaveBeenCalled()
	})
})
