import { env } from '@app/env'
import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth/auth'
import { sendWelcomeEmail } from '@/lib/mail/mail'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

function makeSignUpPayload() {
	return {
		name: faker.person.fullName(),
		email: faker.internet.email().toLowerCase(),
		password: faker.internet.password({ length: 10 }),
	}
}

describe('POST /auth/sign-up', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('cria o usuário e repassa a resposta do better-auth', async () => {
		const payload = makeSignUpPayload()
		const responseBody = {
			user: { id: faker.string.uuid(), email: payload.email },
		}

		vi.mocked(auth.api.signUpEmail).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-up',
			payload,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.signUpEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				body: {
					name: payload.name,
					email: payload.email,
					password: payload.password,
					callbackURL: `${env.WEB_URL}/verificar-email?email=${encodeURIComponent(payload.email)}`,
				},
				asResponse: true,
			}),
		)
	})

	it('dispara o e-mail de boas-vindas com os dados do usuário criado', async () => {
		const payload = makeSignUpPayload()

		vi.mocked(auth.api.signUpEmail).mockResolvedValue(
			makeAuthResponse({ user: { email: payload.email } }) as never,
		)

		await app.inject({ method: 'POST', url: '/auth/sign-up', payload })

		expect(sendWelcomeEmail).toHaveBeenCalledWith({
			to: payload.email,
			name: payload.name,
		})
	})

	it('não falha a requisição quando o envio do e-mail de boas-vindas falha', async () => {
		const payload = makeSignUpPayload()

		vi.mocked(auth.api.signUpEmail).mockResolvedValue(
			makeAuthResponse({ user: { email: payload.email } }) as never,
		)
		vi.mocked(sendWelcomeEmail).mockRejectedValue(new Error('SMTP fora do ar'))

		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-up',
			payload,
		})

		expect(response.statusCode).toBe(200)
	})

	it('retorna 409 quando o e-mail já está cadastrado', async () => {
		vi.mocked(auth.api.signUpEmail).mockResolvedValue(
			makeAuthResponse(
				{ code: 'USER_ALREADY_EXISTS', message: 'E-mail já cadastrado' },
				{ status: 409 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-up',
			payload: makeSignUpPayload(),
		})

		expect(response.statusCode).toBe(409)
	})

	it('retorna 400 quando os dados enviados são inválidos', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/sign-up',
			payload: { name: 'ab', email: 'not-an-email', password: '123' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.signUpEmail).not.toHaveBeenCalled()
	})
})
