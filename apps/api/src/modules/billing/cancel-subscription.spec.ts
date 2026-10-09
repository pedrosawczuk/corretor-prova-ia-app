import { db, eq, subscriptionsTable } from '@app/db'
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
import { BillingProviderError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { cancelAsaasSubscription } from '@/lib/billing/cancel-asaas-subscription'
import { createTestApp } from '@/test/create-test-app'
import { insertSubscription } from '@/test/db-factories/insert-subscription'
import { insertUser } from '@/test/db-factories/insert-user'

vi.mock('@/lib/billing/cancel-asaas-subscription', () => ({
	cancelAsaasSubscription: vi.fn(),
}))

type User = Awaited<ReturnType<typeof insertUser>>

async function selectSubscription(id: string) {
	const [row] = await db
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.id, id))

	return row
}

describe('POST /billing/cancel (integração)', () => {
	let app: FastifyInstance
	let user: User

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		user = await insertUser()
		vi.mocked(getAuthenticatedUser).mockResolvedValue(user as never)
	})

	it('cancela no Asaas e agenda o fim de acesso para o fim do ciclo pago', async () => {
		const subscription = await insertSubscription({
			userId: user.id,
			cancelAtPeriodEnd: false,
		})
		vi.mocked(cancelAsaasSubscription).mockResolvedValue(undefined)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/cancel',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			cancelAtPeriodEnd: true,
			currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
		})
		expect(cancelAsaasSubscription).toHaveBeenCalledWith(
			subscription.asaasSubscriptionId,
		)
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'active',
			cancelAtPeriodEnd: true,
			pendingPlanId: null,
		})
	})

	it('é idempotente quando o cancelamento já havia sido solicitado antes', async () => {
		const subscription = await insertSubscription({
			userId: user.id,
			cancelAtPeriodEnd: true,
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/cancel',
		})

		expect(response.statusCode).toBe(200)
		expect(cancelAsaasSubscription).not.toHaveBeenCalled()
		expect(await selectSubscription(subscription.id)).toMatchObject({
			cancelAtPeriodEnd: true,
			updatedAt: subscription.updatedAt,
		})
	})

	it('retorna 404 quando não há assinatura ativa', async () => {
		await insertSubscription({ userId: user.id, status: 'canceled' })

		const response = await app.inject({
			method: 'POST',
			url: '/billing/cancel',
		})

		expect(response.statusCode).toBe(404)
		expect(cancelAsaasSubscription).not.toHaveBeenCalled()
	})

	it('não marca cancelamento local quando a chamada ao Asaas falha', async () => {
		const subscription = await insertSubscription({
			userId: user.id,
			cancelAtPeriodEnd: false,
		})
		vi.mocked(cancelAsaasSubscription).mockRejectedValue(
			new BillingProviderError('Provedor indisponível.'),
		)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/cancel',
		})

		expect(response.statusCode).toBe(502)
		expect(await selectSubscription(subscription.id)).toMatchObject({
			cancelAtPeriodEnd: false,
			updatedAt: subscription.updatedAt,
		})
	})
})
