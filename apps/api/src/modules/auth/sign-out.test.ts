import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/sign-out', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('encerra a sessão do usuário e repassa a resposta do better-auth', async () => {
		const responseBody = { success: true }

		vi.mocked(auth.api.signOut).mockResolvedValue(
			makeAuthResponse(responseBody, {
				headers: {
					'set-cookie': 'better-auth.session=; Path=/; HttpOnly; Max-Age=0',
				},
			}) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-out',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(response.cookies).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'better-auth.session' }),
			]),
		)
	})
})
