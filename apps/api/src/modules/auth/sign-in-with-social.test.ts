import { env } from '@app/env'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/sign-in/social', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('retorna a url de redirecionamento do provedor social', async () => {
		const responseBody = { url: 'https://accounts.google.com/o/oauth2/v2/auth' }

		vi.mocked(auth.api.signInSocial).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-in/social',
			payload: {
				provider: 'google',
				callbackURL: `${env.BETTER_AUTH_URL}/dashboard`,
			},
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.signInSocial).toHaveBeenCalledWith(
			expect.objectContaining({
				body: {
					provider: 'google',
					callbackURL: `${env.BETTER_AUTH_URL}/dashboard`,
				},
			}),
		)
	})

	it('retorna 400 quando o provider não é suportado', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-in/social',
			payload: {
				provider: 'facebook',
				callbackURL: `${env.BETTER_AUTH_URL}/dashboard`,
			},
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.signInSocial).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o domínio da callbackURL não é permitido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-in/social',
			payload: {
				provider: 'google',
				callbackURL: 'https://site-malicioso.com/dashboard',
			},
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.signInSocial).not.toHaveBeenCalled()
	})
})
