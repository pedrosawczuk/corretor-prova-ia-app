import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/update-profile', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('atualiza o nome do perfil do usuário autenticado', async () => {
		const name = faker.person.fullName()
		const responseBody = { user: { id: faker.string.uuid(), name } }

		vi.mocked(auth.api.updateUser).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/update-profile',
			payload: { name },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.updateUser).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { name, phoneNumber: undefined },
				asResponse: true,
			}),
		)
	})

	it('atualiza o telefone do perfil do usuário autenticado', async () => {
		const name = faker.person.fullName()
		const phoneNumber = '(11) 99999-9999'
		const responseBody = {
			user: { id: faker.string.uuid(), name, phoneNumber },
		}

		vi.mocked(auth.api.updateUser).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/update-profile',
			payload: { name, phoneNumber },
		})

		expect(response.statusCode).toBe(200)
		expect(auth.api.updateUser).toHaveBeenCalledWith(
			expect.objectContaining({
				body: { name, phoneNumber },
				asResponse: true,
			}),
		)
	})

	it('retorna 400 quando o telefone enviado é inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/update-profile',
			payload: { name: faker.person.fullName(), phoneNumber: '11999999999' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.updateUser).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o nome enviado é inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/update-profile',
			payload: { name: 'ab' },
		})

		expect(response.statusCode).toBe(400)
		expect(auth.api.updateUser).not.toHaveBeenCalled()
	})
})
