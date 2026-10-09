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
import { BillingProviderError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { createAsaasCustomer } from '@/lib/billing/create-asaas-customer'
import { createAsaasPayment } from '@/lib/billing/create-asaas-payment'
import { createAsaasSubscription } from '@/lib/billing/create-asaas-subscription'
import { getAsaasSubscriptionFirstPaymentUrl } from '@/lib/billing/get-asaas-subscription-first-payment-url'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makePlan } from '@/test/factories/make-plan'
import { makeSubscription } from '@/test/factories/make-subscription'

vi.mock('@/lib/billing/create-asaas-customer', () => ({
	createAsaasCustomer: vi.fn(),
}))

vi.mock('@/lib/billing/create-asaas-payment', () => ({
	createAsaasPayment: vi.fn(),
}))

vi.mock('@/lib/billing/create-asaas-subscription', () => ({
	createAsaasSubscription: vi.fn(),
}))

vi.mock('@/lib/billing/get-asaas-subscription-first-payment-url', () => ({
	getAsaasSubscriptionFirstPaymentUrl: vi.fn(),
}))

const VALID_CPF = '529.982.247-25'

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
		vi.mocked(createAsaasCustomer).mockResolvedValue({ id: 'cus_123' })
	})

	it('cria cliente no Asaas, grava billing_customers e retorna a invoiceUrl do avulso', async () => {
		const plan = makePlan({
			slug: 'avulso',
			name: 'Avulso',
			billingType: 'one_time',
			priceCents: 1990,
			creditsGranted: 10,
			monthlyCorrectionsLimit: null,
		})
		const insertChain = createDbChain([])

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([plan]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(
				createDbChain([{ asaasCustomerId: 'cus_123' }]) as never,
			)
		vi.mocked(db.insert).mockReturnValue(insertChain as never)
		vi.mocked(createAsaasPayment).mockResolvedValue({
			id: 'pay_123',
			invoiceUrl: 'https://sandbox.asaas.com/i/pay_123',
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso', cpfCnpj: VALID_CPF },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			checkoutUrl: 'https://sandbox.asaas.com/i/pay_123',
		})
		expect(createAsaasCustomer).toHaveBeenCalledWith({
			name: user.name,
			email: user.email,
			cpfCnpj: '52998224725',
			externalReference: user.id,
		})
		expect(insertChain.values).toHaveBeenCalledWith({
			userId: user.id,
			asaasCustomerId: 'cus_123',
		})
		expect(createAsaasPayment).toHaveBeenCalledWith(
			expect.objectContaining({
				customerId: 'cus_123',
				valueCents: 1990,
				description: 'Avulso - 10 correções',
				externalReference: `${user.id}:avulso`,
				successUrl: expect.stringContaining(
					'/dashboard/configuracoes?checkout=success',
				),
			}),
		)
	})

	it('cria assinatura recorrente e retorna a url da primeira cobrança', async () => {
		const plan = makePlan({ slug: 'essencial', billingType: 'recurring' })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([plan]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(
				createDbChain([{ asaasCustomerId: 'cus_existente' }]) as never,
			)
		vi.mocked(createAsaasSubscription).mockResolvedValue({ id: 'sub_123' })
		vi.mocked(getAsaasSubscriptionFirstPaymentUrl).mockResolvedValue(
			'https://sandbox.asaas.com/i/sub_pay_1',
		)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'essencial' },
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			checkoutUrl: 'https://sandbox.asaas.com/i/sub_pay_1',
		})
		expect(createAsaasSubscription).toHaveBeenCalledWith(
			expect.objectContaining({
				customerId: 'cus_existente',
				valueCents: plan.priceCents,
				description: `Plano ${plan.name}`,
				externalReference: `${user.id}:essencial`,
			}),
		)
		expect(getAsaasSubscriptionFirstPaymentUrl).toHaveBeenCalledWith('sub_123')
	})

	it('reaproveita o cliente existente mesmo quando o CPF é enviado de novo', async () => {
		const plan = makePlan({
			slug: 'avulso',
			billingType: 'one_time',
			creditsGranted: 10,
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([plan]) as never)
			.mockReturnValueOnce(
				createDbChain([{ asaasCustomerId: 'cus_existente' }]) as never,
			)
		vi.mocked(createAsaasPayment).mockResolvedValue({
			id: 'pay_456',
			invoiceUrl: 'https://sandbox.asaas.com/i/pay_456',
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso', cpfCnpj: VALID_CPF },
		})

		expect(response.statusCode).toBe(200)
		expect(createAsaasCustomer).not.toHaveBeenCalled()
		expect(db.insert).not.toHaveBeenCalled()
		expect(createAsaasPayment).toHaveBeenCalledWith(
			expect.objectContaining({ customerId: 'cus_existente' }),
		)
	})

	it('retorna 400 quando o usuário não tem cliente no Asaas e não informou CPF/CNPJ', async () => {
		const plan = makePlan({ slug: 'avulso', billingType: 'one_time' })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([plan]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso' },
		})

		expect(response.statusCode).toBe(400)
		expect(response.json().message).toBe(
			'Informe seu CPF ou CNPJ para continuar.',
		)
		expect(createAsaasCustomer).not.toHaveBeenCalled()
		expect(createAsaasPayment).not.toHaveBeenCalled()
	})

	it('retorna 400 quando o CPF/CNPJ enviado é inválido', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso', cpfCnpj: '111.111.111-11' },
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
		expect(createAsaasCustomer).not.toHaveBeenCalled()
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
		expect(createAsaasSubscription).not.toHaveBeenCalled()
	})

	it('retorna 404 quando o plano não existe ou está inativo', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(404)
		expect(createAsaasCustomer).not.toHaveBeenCalled()
	})

	it('retorna 502 quando o Asaas falha ao criar a cobrança', async () => {
		const plan = makePlan({ slug: 'avulso', billingType: 'one_time' })

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([plan]) as never)
			.mockReturnValueOnce(
				createDbChain([{ asaasCustomerId: 'cus_existente' }]) as never,
			)
		vi.mocked(createAsaasPayment).mockRejectedValue(new BillingProviderError())

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso' },
		})

		expect(response.statusCode).toBe(502)
		expect(response.json().code).toBe('BILLING_PROVIDER_ERROR')
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
