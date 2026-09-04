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
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'

describe('GET /billing/status', () => {
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

	it('retorna plano nulo e saldo zerado quando o usuário não tem assinatura nem crédito', async () => {
		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(createDbChain([{ creditBalance: 0 }]) as never)

		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			plan: null,
			subscriptionStatus: null,
			currentPeriodEnd: null,
			cancelAtPeriodEnd: false,
			correctionsUsed: 0,
			creditBalance: 0,
		})
	})

	it('retorna os dados do plano e o uso do ciclo quando o usuário tem assinatura ativa', async () => {
		const currentPeriodEnd = new Date('2026-10-01T00:00:00.000Z')

		vi.mocked(db.select)
			.mockReturnValueOnce(
				createDbChain([
					{
						status: 'active',
						currentPeriodStart: new Date('2026-09-01T00:00:00.000Z'),
						currentPeriodEnd,
						cancelAtPeriodEnd: false,
						planSlug: 'essencial',
						planName: 'Essencial',
						monthlyCorrectionsLimit: 100,
						allowsDocxExport: false,
					},
				]) as never,
			)
			.mockReturnValueOnce(createDbChain([{ correctionsUsed: 42 }]) as never)
			.mockReturnValueOnce(createDbChain([{ creditBalance: 3 }]) as never)

		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			plan: {
				slug: 'essencial',
				name: 'Essencial',
				monthlyCorrectionsLimit: 100,
				allowsDocxExport: false,
			},
			subscriptionStatus: 'active',
			currentPeriodEnd: currentPeriodEnd.toISOString(),
			cancelAtPeriodEnd: false,
			correctionsUsed: 42,
			creditBalance: 3,
		})
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(getAuthenticatedUser).mockRejectedValue(
			new UnauthorizedError('Você precisa estar autenticado para continuar.'),
		)

		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(401)
	})
})
