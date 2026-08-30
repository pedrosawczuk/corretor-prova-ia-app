import { db } from '@app/db'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { UnauthorizedError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeSubject } from '@/test/factories/make-subject'

describe('GET /subjects', () => {
	let app: FastifyInstance
	const user = makeAuthenticatedUser()

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		vi.mocked(getAuthenticatedUser).mockResolvedValue(user as never)
	})

	it('retorna 200 com as disciplinas cadastradas para o professor autenticado', async () => {
		const subjects = [makeSubject(), makeSubject()]
		vi.mocked(db.select).mockReturnValue(createDbChain(subjects) as never)

		const response = await app.inject({ method: 'GET', url: '/subjects' })

		expect(response.statusCode).toBe(200)
		expect(response.json()).toHaveLength(2)
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(getAuthenticatedUser).mockRejectedValue(
			new UnauthorizedError('Você precisa estar autenticado para continuar.'),
		)

		const response = await app.inject({ method: 'GET', url: '/subjects' })

		expect(response.statusCode).toBe(401)
		expect(db.select).not.toHaveBeenCalled()
	})
})
