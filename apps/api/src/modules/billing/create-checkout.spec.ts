import { billingCustomersTable, db, eq } from '@app/db'
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
import { createTestApp } from '@/test/create-test-app'
import { insertBillingCustomer } from '@/test/db-factories/insert-billing-customer'
import { insertPlan } from '@/test/db-factories/insert-plan'
import { insertSubscription } from '@/test/db-factories/insert-subscription'
import { insertUser } from '@/test/db-factories/insert-user'

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

type User = Awaited<ReturnType<typeof insertUser>>

function insertAvulsoPlan() {
	return insertPlan({
		slug: 'avulso',
		name: 'Avulso',
		billingType: 'one_time',
		priceCents: 1990,
		creditsGranted: 10,
		monthlyCorrectionsLimit: null,
	})
}

function selectBillingCustomers(userId: string) {
	return db
		.select()
		.from(billingCustomersTable)
		.where(eq(billingCustomersTable.userId, userId))
}

describe('POST /billing/checkout (integração)', () => {
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
		vi.mocked(createAsaasCustomer).mockResolvedValue({ id: 'cus_123' })
		vi.mocked(createAsaasPayment).mockResolvedValue({
			id: 'pay_123',
			invoiceUrl: 'https://sandbox.asaas.com/i/pay_123',
		})
	})

	it('cria cliente no Asaas, grava billing_customers e retorna a invoiceUrl do avulso', async () => {
		await insertAvulsoPlan()

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
		expect(await selectBillingCustomers(user.id)).toEqual([
			expect.objectContaining({ userId: user.id, asaasCustomerId: 'cus_123' }),
		])
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
		const plan = await insertPlan({
			slug: 'essencial',
			billingType: 'recurring',
		})
		await insertBillingCustomer({
			userId: user.id,
			asaasCustomerId: 'cus_existente',
		})
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
		await insertAvulsoPlan()
		await insertBillingCustomer({
			userId: user.id,
			asaasCustomerId: 'cus_existente',
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso', cpfCnpj: VALID_CPF },
		})

		expect(response.statusCode).toBe(200)
		expect(createAsaasCustomer).not.toHaveBeenCalled()
		expect(await selectBillingCustomers(user.id)).toEqual([
			expect.objectContaining({ asaasCustomerId: 'cus_existente' }),
		])
		expect(createAsaasPayment).toHaveBeenCalledWith(
			expect.objectContaining({ customerId: 'cus_existente' }),
		)
	})

	it('gera uma única linha em billing_customers e uma única chamada ao Asaas em dois checkouts seguidos com CPF', async () => {
		await insertAvulsoPlan()

		const first = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso', cpfCnpj: VALID_CPF },
		})
		const second = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso', cpfCnpj: VALID_CPF },
		})

		expect(first.statusCode).toBe(200)
		expect(second.statusCode).toBe(200)
		expect(createAsaasCustomer).toHaveBeenCalledTimes(1)
		expect(await selectBillingCustomers(user.id)).toHaveLength(1)
		expect(createAsaasPayment).toHaveBeenCalledTimes(2)
		expect(createAsaasPayment).toHaveBeenLastCalledWith(
			expect.objectContaining({ customerId: 'cus_123' }),
		)
	})

	it('retorna 400 quando o usuário não tem cliente no Asaas e não informou CPF/CNPJ', async () => {
		await insertAvulsoPlan()

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
		expect(await selectBillingCustomers(user.id)).toHaveLength(0)
	})

	it('retorna 400 quando o CPF/CNPJ enviado é inválido', async () => {
		await insertAvulsoPlan()

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'avulso', cpfCnpj: '111.111.111-11' },
		})

		expect(response.statusCode).toBe(400)
		expect(createAsaasCustomer).not.toHaveBeenCalled()
		expect(await selectBillingCustomers(user.id)).toHaveLength(0)
	})

	it('bloqueia com 409 quando o usuário já tem uma assinatura ativa', async () => {
		const plan = await insertPlan({ slug: 'pro', billingType: 'recurring' })
		await insertSubscription({
			userId: user.id,
			planId: plan.id,
			status: 'active',
		})

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(409)
		expect(createAsaasSubscription).not.toHaveBeenCalled()
	})

	it('retorna 404 quando o plano não existe ou está inativo', async () => {
		await insertPlan({ slug: 'pro', billingType: 'recurring', isActive: false })

		const response = await app.inject({
			method: 'POST',
			url: '/billing/checkout',
			payload: { planSlug: 'pro' },
		})

		expect(response.statusCode).toBe(404)
		expect(createAsaasCustomer).not.toHaveBeenCalled()
	})

	it('retorna 502 quando o Asaas falha ao criar a cobrança', async () => {
		await insertAvulsoPlan()
		await insertBillingCustomer({
			userId: user.id,
			asaasCustomerId: 'cus_existente',
		})
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
		expect(createAsaasCustomer).not.toHaveBeenCalled()
		expect(createAsaasPayment).not.toHaveBeenCalled()
	})
})
