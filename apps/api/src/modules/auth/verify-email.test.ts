import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('GET /auth/verify-email', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('confirma o e-mail e retorna o status quando nenhuma callbackURL é informada', async () => {
		const token = faker.string.alphanumeric(32)
		const responseBody = { status: true }

		vi.mocked(auth.api.verifyEmail).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'GET',
			url: `/auth/verify-email?token=${token}`,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.verifyEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				query: { token, callbackURL: undefined },
				asResponse: true,
			}),
		)
	})

	it('redireciona para a callbackURL quando ela é informada', async () => {
		const token = faker.string.alphanumeric(32)
		const callbackURL = 'http://localhost:3000/dashboard'

		vi.mocked(auth.api.verifyEmail).mockResolvedValue(
			new Response(null, {
				status: 302,
				headers: { location: callbackURL },
			}) as never,
		)

		const response = await app.inject({
			method: 'GET',
			url: `/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(callbackURL)}`,
		})

		expect(response.statusCode).toBe(302)
		expect(response.headers.location).toBe(callbackURL)
	})

	it('retorna 400 quando o token não é informado', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/auth/verify-email',
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.verifyEmail).not.toHaveBeenCalled()
	})
})
