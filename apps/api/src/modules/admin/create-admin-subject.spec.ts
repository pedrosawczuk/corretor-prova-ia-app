import { db, eq, subjectsTable } from '@app/db'
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
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import { createTestApp } from '@/test/create-test-app'
import { insertUser } from '@/test/db-factories/insert-user'

describe('POST /admin/subjects (integração)', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		const admin = await insertUser({ role: 'admin', twoFactorEnabled: true })
		vi.mocked(getAuthenticatedAdmin).mockResolvedValue(admin as never)
	})

	it('cria a disciplina no banco e retorna 201', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/admin/subjects',
			payload: { name: 'Matemática' },
		})

		expect(response.statusCode).toBe(201)

		const rows = await db
			.select()
			.from(subjectsTable)
			.where(eq(subjectsTable.name, 'Matemática'))

		expect(rows).toHaveLength(1)
		expect(response.json()).toMatchObject({
			id: rows[0].id,
			name: 'Matemática',
		})
	})

	it('retorna 409 e não duplica quando já existe disciplina com o mesmo nome', async () => {
		await db.insert(subjectsTable).values({ name: 'História' })

		const response = await app.inject({
			method: 'POST',
			url: '/admin/subjects',
			payload: { name: 'História' },
		})

		expect(response.statusCode).toBe(409)

		const rows = await db
			.select()
			.from(subjectsTable)
			.where(eq(subjectsTable.name, 'História'))

		expect(rows).toHaveLength(1)
	})
})
