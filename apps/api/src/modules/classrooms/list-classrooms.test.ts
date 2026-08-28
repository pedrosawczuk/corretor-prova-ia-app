import { db } from '@app/db'
import type { FastifyInstance } from 'fastify'
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { UnauthorizedError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeClassroom } from '@/test/factories/make-classroom'

describe('GET /classrooms', () => {
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

	it('retorna 200 com as turmas do professor autenticado', async () => {
		const classrooms = [
			makeClassroom({ teacherId: user.id }),
			makeClassroom({ teacherId: user.id }),
		]
		vi.mocked(db.select).mockReturnValue(createDbChain(classrooms) as never)

		const response = await app.inject({ method: 'GET', url: '/classrooms' })

		expect(response.statusCode).toBe(200)
		expect(response.json()).toHaveLength(2)
	})

	it('retorna 200 com uma lista vazia quando o professor não possui turmas', async () => {
		vi.mocked(db.select).mockReturnValue(createDbChain([]) as never)

		const response = await app.inject({ method: 'GET', url: '/classrooms' })

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual([])
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(getAuthenticatedUser).mockRejectedValue(
			new UnauthorizedError('Você precisa estar autenticado para continuar.'),
		)

		const response = await app.inject({ method: 'GET', url: '/classrooms' })

		expect(response.statusCode).toBe(401)
		expect(db.select).not.toHaveBeenCalled()
	})
})
