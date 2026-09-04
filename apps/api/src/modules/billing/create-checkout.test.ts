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
import { createAbacatePayCustomer } from '@/lib/billing/create-abacatepay-customer'
import { createAbacatePayBilling } from '@/lib/billing/create-billing'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makePlan } from '@/test/factories/make-plan'
import { makeSubscription } from '@/test/factories/make-subscription'

vi.mock('@/lib/billing/create-abacatepay-customer', () => ({
	createAbacatePayCustomer: vi.fn(),
}))

vi.mock('@/lib/billing/create-billing', () => ({
	createAbacatePayBilling: vi.fn(),
}))

describe('POST /billing/checkout', () => {
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
		vi.mocked(createAbacatePayCustomer).mockResolvedValue({ id: 'cust_123' })
	})

	it('cria checkout de cobrança única para o plano avulso e retorna a url', async () => {
		const plan = makePlan({
			slug: 'avulso',
			billingType: 'one_time',
			creditsGranted: 10,
			monthlyCorrectionsLimit: null,
		})

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([plan]) as never)
		vi.mocked(createAbacatePayBilling).mockResolvedValue({
			id: 'bill_123',
			url: 'https://app.abacatepay.com/pay/bill_123',
			status: 'PENDING',
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso' },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			checkoutUrl: 'https://app.abacatepay.com/pay/bill_123',
		})
		expect(createAbacatePayBilling).toHaveBeenCalledWith(
			expect.objectContaining({
				billingType: 'one_time',
				productId: plan.abacatepayProductId,
				customerId: 'cust_123',
				metadata: { userId: user.id, planSlug: 'avulso' },
			}),
		)
	})

	it('cria checkout de assinatura recorrente quando o usuário não tem assinatura ativa', async () => {
		const plan = makePlan({ slug: 'essencial', billingType: 'recurring' })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([plan]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
		vi.mocked(createAbacatePayBilling).mockResolvedValue({
			id: 'subs_checkout_123',
			url: 'https://app.abacatepay.com/pay/subs_checkout_123',
			status: 'PENDING',
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'essencial' },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			checkoutUrl: 'https://app.abacatepay.com/pay/subs_checkout_123',
		})
	})

	it('bloqueia com 409 quando o usuário já tem uma assinatura ativa', async () => {
		const plan = makePlan({ slug: 'pro', billingType: 'recurring' })
		const activeSubscription = makeSubscription({
			userId: user.id,
			status: 'active',
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([plan]) as never)
			.mockReturnValueOnce(createDbChain([activeSubscription]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(409)
		expect(createAbacatePayBilling).not.toHaveBeenCalled()
	})

	it('retorna 404 quando o plano não existe ou está inativo', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(404)
		expect(createAbacatePayCustomer).not.toHaveBeenCalled()
	})

	it('retorna 502 quando o plano ainda não tem produto configurado na AbacatePay', async () => {
		const plan = makePlan({ slug: 'pro', abacatepayProductId: null })

		vi.mocked(db.select).mockReturnValueOnce(createDbChain([plan]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(502)
		expect(createAbacatePayCustomer).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o planSlug enviado é inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'inexistente' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})
})
