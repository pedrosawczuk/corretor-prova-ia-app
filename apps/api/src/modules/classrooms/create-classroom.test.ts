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
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateCache } from '@/lib/cache/redis'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeClassroom } from '@/test/factories/make-classroom'
import { makeClassroomInput } from '@/test/factories/make-classroom-input'
import { classroomListCacheKey } from './classroom-cache'

describe('POST /classrooms', () => {
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

	it('cria a turma para o professor autenticado e retorna 201', async () => {
		const payload = makeClassroomInput()
		const createdClassroom = makeClassroom({ ...payload, teacherId: user.id })

		const chain = createDbChain([createdClassroom])
		vi.mocked(db.insert).mockReturnValue(chain as never)

		const response = await app.inject({
			method: 'POST',
			url: '/classrooms',
			payload,
		})

		expect(response.statusCode).toBe(201)
		expect(chain.values).toHaveBeenCalledWith({
			name: payload.name,
			subject: payload.subject,
			description: payload.description,
			teacherId: user.id,
		})
		expect(response.json()).toEqual(
			expect.objectContaining({
				id: createdClassroom.id,
				name: payload.name,
				subject: payload.subject,
			}),
		)
		expect(invalidateCache).toHaveBeenCalledWith(classroomListCacheKey(user.id))
	})

	it('cria a turma sem descrição quando o campo não é informado', async () => {
		const payload = makeClassroomInput({ description: undefined })
		const createdClassroom = makeClassroom({ ...payload, teacherId: user.id })

		const chain = createDbChain([createdClassroom])
		vi.mocked(db.insert).mockReturnValue(chain as never)

		const response = await app.inject({
			method: 'POST',
			url: '/classrooms',
			payload,
		})

		expect(response.statusCode).toBe(201)
		expect(chain.values).toHaveBeenCalledWith({
			name: payload.name,
			subject: payload.subject,
			description: undefined,
			teacherId: user.id,
		})
	})

	it('retorna 400 quando os dados enviados são inválidos', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/classrooms',
			payload: { name: 'A' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(getAuthenticatedUser).mockRejectedValue(
			new UnauthorizedError('Você precisa estar autenticado para continuar.'),
		)

		const response = await app.inject({
			method: 'POST',
			url: '/classrooms',
			payload: makeClassroomInput(),
		})

		expect(response.statusCode).toBe(401)
		expect(db.insert).not.toHaveBeenCalled()
	})
})
