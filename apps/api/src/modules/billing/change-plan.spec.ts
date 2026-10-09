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
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { cancelAsaasSubscription } from '@/lib/billing/cancel-asaas-subscription'
import { createAsaasSubscription } from '@/lib/billing/create-asaas-subscription'
import { getAsaasSubscriptionFirstPaymentUrl } from '@/lib/billing/get-asaas-subscription-first-payment-url'
import { createTestApp } from '@/test/create-test-app'
import { insertBillingCustomer } from '@/test/db-factories/insert-billing-customer'
import { insertPlan } from '@/test/db-factories/insert-plan'
import { insertSubscription } from '@/test/db-factories/insert-subscription'
import { insertUser } from '@/test/db-factories/insert-user'

vi.mock('@/lib/billing/cancel-asaas-subscription', () => ({
	cancelAsaasSubscription: vi.fn(),
}))

vi.mock('@/lib/billing/create-asaas-subscription', () => ({
	createAsaasSubscription: vi.fn(),
}))

vi.mock('@/lib/billing/get-asaas-subscription-first-payment-url', () => ({
	getAsaasSubscriptionFirstPaymentUrl: vi.fn(),
}))

type User = Awaited<ReturnType<typeof insertUser>>

async function selectSubscription(id: string) {
	const [row] = await db
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.id, id))

	return row
}

function insertRecurringPlans() {
	return Promise.all([
		insertPlan({ slug: 'essencial', name: 'Essencial', priceCents: 3990 }),
		insertPlan({ slug: 'pro', name: 'Pro', priceCents: 9990 }),
	])
}

describe('POST /billing/change-plan (integração)', () => {
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

	it('agenda a troca de plano para a próxima renovação por padrão (sem prorate)', async () => {
		const [currentPlan, targetPlan] = await insertRecurringPlans()
		const subscription = await insertSubscription({
			userId: user.id,
			planId: currentPlan.id,
			pendingPlanId: null,
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			pendingPlanSlug: 'pro',
			effectiveAt: subscription.currentPeriodEnd.toISOString(),
		})
		expect(cancelAsaasSubscription).not.toHaveBeenCalled()
		expect(createAsaasSubscription).not.toHaveBeenCalled()
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'active',
			planId: currentPlan.id,
			pendingPlanId: targetPlan.id,
		})
	})

	it('desfaz a troca agendada quando o usuário volta para o plano atual', async () => {
		const [currentPlan, targetPlan] = await insertRecurringPlans()
		const subscription = await insertSubscription({
			userId: user.id,
			planId: currentPlan.id,
			pendingPlanId: targetPlan.id,
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'essencial' },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			pendingPlanSlug: null,
			effectiveAt: subscription.currentPeriodEnd.toISOString(),
		})
		expect(await selectSubscription(subscription.id)).toMatchObject({
			planId: currentPlan.id,
			pendingPlanId: null,
		})
	})

	it('cancela a assinatura atual e cria um novo checkout quando immediate é true', async () => {
		const [currentPlan, targetPlan] = await insertRecurringPlans()
		const subscription = await insertSubscription({
			userId: user.id,
			planId: currentPlan.id,
		})
		await insertBillingCustomer({ userId: user.id, asaasCustomerId: 'cus_123' })
		vi.mocked(cancelAsaasSubscription).mockResolvedValue(undefined)
		vi.mocked(createAsaasSubscription).mockResolvedValue({ id: 'sub_new' })
		vi.mocked(getAsaasSubscriptionFirstPaymentUrl).mockResolvedValue(
			'https://sandbox.asaas.com/i/sub_new_pay',
		)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'pro', immediate: true },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			checkoutUrl: 'https://sandbox.asaas.com/i/sub_new_pay',
		})
		expect(cancelAsaasSubscription).toHaveBeenCalledWith(
			subscription.asaasSubscriptionId,
		)
		expect(createAsaasSubscription).toHaveBeenCalledWith(
			expect.objectContaining({
				customerId: 'cus_123',
				valueCents: targetPlan.priceCents,
				externalReference: `${user.id}:pro`,
			}),
		)
		expect(getAsaasSubscriptionFirstPaymentUrl).toHaveBeenCalledWith('sub_new')
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'canceled',
			cancelAtPeriodEnd: false,
			pendingPlanId: null,
		})
	})

	it('retorna 404 quando o usuário não tem assinatura ativa', async () => {
		const [currentPlan] = await insertRecurringPlans()
		const canceled = await insertSubscription({
			userId: user.id,
			planId: currentPlan.id,
			status: 'canceled',
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(404)
		expect(await selectSubscription(canceled.id)).toMatchObject({
			status: 'canceled',
			pendingPlanId: null,
			updatedAt: canceled.updatedAt,
		})
	})

	it('retorna 409 quando o usuário já está no plano solicitado e não há troca pendente', async () => {
		const [, currentPlan] = await insertRecurringPlans()
		const subscription = await insertSubscription({
			userId: user.id,
			planId: currentPlan.id,
			pendingPlanId: null,
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(409)
		expect(await selectSubscription(subscription.id)).toMatchObject({
			planId: currentPlan.id,
			pendingPlanId: null,
			updatedAt: subscription.updatedAt,
		})
	})

	it('retorna 400 quando o planSlug é avulso (não suportado nesta rota)', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'avulso' },
		})

		expect(response.statusCode).toBe(400)
		expect(cancelAsaasSubscription).not.toHaveBeenCalled()
	})
})
