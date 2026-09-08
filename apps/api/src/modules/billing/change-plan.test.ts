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
import { cancelAbacatePaySubscription } from '@/lib/billing/cancel-abacatepay-billing'
import { createAbacatePayCustomer } from '@/lib/billing/create-abacatepay-customer'
import { createAbacatePayBilling } from '@/lib/billing/create-billing'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makePlan } from '@/test/factories/make-plan'
import { makeSubscription } from '@/test/factories/make-subscription'

vi.mock('@/lib/billing/cancel-abacatepay-billing', () => ({
	cancelAbacatePaySubscription: vi.fn(),
}))

vi.mock('@/lib/billing/create-abacatepay-customer', () => ({
	createAbacatePayCustomer: vi.fn(),
}))

vi.mock('@/lib/billing/create-billing', () => ({
	createAbacatePayBilling: vi.fn(),
}))

describe('POST /billing/change-plan', () => {
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

	it('agenda a troca de plano para a próxima renovação por padrão (sem prorate)', async () => {
		const currentPlan = makePlan({ slug: 'essencial' })
		const targetPlan = makePlan({ slug: 'pro' })
		const subscription = makeSubscription({
			userId: user.id,
			planId: currentPlan.id,
			pendingPlanId: null,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([targetPlan]) as never)
			.mockReturnValueOnce(createDbChain([subscription]) as never)
		vi.mocked(db.update).mockReturnValue(createDbChain([]) as never)

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
		expect(cancelAbacatePaySubscription).not.toHaveBeenCalled()
		expect(createAbacatePayBilling).not.toHaveBeenCalled()
	})

	it('cancela a assinatura atual e cria um novo checkout quando immediate é true', async () => {
		const currentPlan = makePlan({ slug: 'essencial' })
		const targetPlan = makePlan({ slug: 'pro' })
		const subscription = makeSubscription({
			userId: user.id,
			planId: currentPlan.id,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([targetPlan]) as never)
			.mockReturnValueOnce(createDbChain([subscription]) as never)
		vi.mocked(db.update).mockReturnValue(createDbChain([]) as never)
		vi.mocked(cancelAbacatePaySubscription).mockResolvedValue(undefined)
		vi.mocked(createAbacatePayCustomer).mockResolvedValue({ id: 'cust_123' })
		vi.mocked(createAbacatePayBilling).mockResolvedValue({
			id: 'subs_new',
			url: 'https://app.abacatepay.com/pay/subs_new',
			status: 'PENDING',
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'pro', immediate: true },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			checkoutUrl: 'https://app.abacatepay.com/pay/subs_new',
		})
		expect(cancelAbacatePaySubscription).toHaveBeenCalledWith(
			subscription.abacatepayBillingId,
		)
		expect(createAbacatePayBilling).toHaveBeenCalledWith(
			expect.objectContaining({
				billingType: 'recurring',
				productId: targetPlan.abacatepayProductId,
				metadata: { userId: user.id, planSlug: 'pro' },
			}),
		)
	})

	it('retorna 404 quando o usuário não tem assinatura ativa', async () => {
		const targetPlan = makePlan({ slug: 'pro' })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([targetPlan]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(404)
		expect(db.update).not.toHaveBeenCalled()
	})

	it('retorna 409 quando o usuário já está no plano solicitado e não há troca pendente', async () => {
		const currentPlan = makePlan({ slug: 'pro' })
		const subscription = makeSubscription({
			userId: user.id,
			planId: currentPlan.id,
			pendingPlanId: null,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([currentPlan]) as never)
			.mockReturnValueOnce(createDbChain([subscription]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(409)
	})

	it('retorna 400 quando o planSlug é avulso (não suportado nesta rota)', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/billing/change-plan',
			payload: { planSlug: 'avulso' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
