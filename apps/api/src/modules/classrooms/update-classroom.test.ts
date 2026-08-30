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
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateCache } from '@/lib/cache/redis'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeClassroom } from '@/test/factories/make-classroom'
import { makeClassroomInput } from '@/test/factories/make-classroom-input'
import { classroomCacheKey, classroomListCacheKey } from './classroom-cache'

describe('PATCH /classrooms/:id', () => {
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

	it('atualiza a turma quando ela pertence ao professor autenticado e retorna 200', async () => {
		const existing = makeClassroom({ teacherId: user.id })
		const payload = makeClassroomInput()
		const updated = makeClassroom({ ...existing, ...payload })

		vi.mocked(db.select).mockReturnValue(createDbChain([existing]) as never)
		const updateChain = createDbChain([updated])
		vi.mocked(db.update).mockReturnValue(updateChain as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/classrooms/${existing.id}`,
			payload,
		})

		expect(response.statusCode).toBe(200)
		expect(updateChain.set).toHaveBeenCalledWith(
			expect.objectContaining({
				name: payload.name,
				subjectId: payload.subjectId,
				description: payload.description,
				updatedAt: expect.any(Date),
			}),
		)
		expect(response.json()).toEqual(
			expect.objectContaining({ id: existing.id, name: payload.name }),
		)
		expect(invalidateCache).toHaveBeenCalledWith(
			classroomCacheKey(existing.id),
			classroomListCacheKey(user.id),
		)
	})

	it('retorna 404 quando a turma não existe', async () => {
		vi.mocked(db.select).mockReturnValue(createDbChain([]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/classrooms/${crypto.randomUUID()}`,
			payload: makeClassroomInput(),
		})

		expect(response.statusCode).toBe(404)
		expect(db.update).not.toHaveBeenCalled()
	})

	it('retorna 404 quando a turma pertence a outro professor', async () => {
		const existing = makeClassroom()
		vi.mocked(db.select).mockReturnValue(createDbChain([existing]) as never)

		const response = await app.inject({
			method: 'PATCH',
			url: `/classrooms/${existing.id}`,
			payload: makeClassroomInput(),
		})

		expect(response.statusCode).toBe(404)
		expect(db.update).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o payload é inválido', async () => {
		const existing = makeClassroom({ teacherId: user.id })

		const response = await app.inject({
			method: 'PATCH',
			url: `/classrooms/${existing.id}`,
			payload: { name: 'A' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o id não é um uuid válido', async () => {
		const response = await app.inject({
			method: 'PATCH',
			url: '/classrooms/id-invalido',
			payload: makeClassroomInput(),
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
