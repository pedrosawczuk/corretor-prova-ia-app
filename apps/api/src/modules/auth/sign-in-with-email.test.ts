import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

function makeSignInPayload() {
	return {
		email: faker.internet.email().toLowerCase(),
		password: faker.internet.password({ length: 10 }),
	}
}

describe('POST /auth/sign-in', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('autentica o usuário e repassa o cookie de sessão', async () => {
		const payload = makeSignInPayload()
		const responseBody = {
			user: { id: faker.string.uuid(), email: payload.email },
		}

		vi.mocked(auth.api.signInEmail).mockResolvedValue(
			makeAuthResponse(responseBody, {
				headers: { 'set-cookie': 'better-auth.session=abc123; Path=/; HttpOnly' },
			}) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-in',
			payload,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(response.cookies).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'better-auth.session' }),
			]),
		)
	})

	it('retorna 401 quando as credenciais são inválidas', async () => {
		vi.mocked(auth.api.signInEmail).mockResolvedValue(
			makeAuthResponse(
				{ code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' },
				{ status: 401 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-in',
			payload: makeSignInPayload(),
		})

		expect(response.statusCode).toBe(401)
	})

	it('retorna 400 quando os dados enviados são inválidos', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-in',
			payload: { email: 'not-an-email', password: '123' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.signInEmail).not.toHaveBeenCalled()
	})
})
