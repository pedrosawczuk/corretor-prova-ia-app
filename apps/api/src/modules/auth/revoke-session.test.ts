import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/revoke-session', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('revoga a sessão informada pelo token', async () => {
		const token = faker.string.alphanumeric(32)
		const responseBody = { status: true }

		vi.mocked(auth.api.revokeSession).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/revoke-session',
			payload: { token },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.revokeSession).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { token },
				asResponse: true,
			}),
		)
	})

	it('retorna 400 quando o token não é informado', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/revoke-session',
			payload: { token: '' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.revokeSession).not.toHaveBeenCalled()
	})
})
