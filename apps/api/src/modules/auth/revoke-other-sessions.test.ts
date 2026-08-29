import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { auth } from '@/lib/auth/auth'
import { createAuthTestApp } from '@/test/create-auth-test-app'
import { makeAuthResponse } from '@/test/factories/make-auth-response'

describe('POST /auth/revoke-other-sessions', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createAuthTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('revoga as demais sessões do usuário autenticado', async () => {
		const responseBody = { status: true }

		vi.mocked(auth.api.revokeOtherSessions).mockResolvedValue(
			makeAuthResponse(responseBody) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/revoke-other-sessions',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(responseBody)
		expect(auth.api.revokeOtherSessions).toHaveBeenCalledWith(
			expect.objectContaining({ asResponse: true }),
		)
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(auth.api.revokeOtherSessions).mockResolvedValue(
			makeAuthResponse(
				{ code: 'UNAUTHORIZED', message: 'Não autenticado' },
				{ status: 401 },
			) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/auth/revoke-other-sessions',
		})

		expect(response.statusCode).toBe(401)
	})
})
