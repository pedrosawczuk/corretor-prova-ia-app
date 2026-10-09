import { db } from '@app/db'
import { env } from '@app/env'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { BillingProviderError } from '@/core/errors'
import { getAsaasSubscription } from '@/lib/billing/get-asaas-subscription'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeSubscription } from '@/test/factories/make-subscription'
import { sendBillingNotificationEmail } from './send-billing-notification-email'

vi.mock('./send-billing-notification-email', () => ({
	sendBillingNotificationEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/billing/get-asaas-subscription', () => ({
	getAsaasSubscription: vi.fn(),
}))

interface TransactionMocks {
	insert?: ReturnType<typeof vi.fn>
	select?: ReturnType<typeof vi.fn>
	update?: ReturnType<typeof vi.fn>
}

function mockTransaction({
	insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_new' }])),
	select = vi.fn(),
	update = vi.fn(() => createDbChain([])),
}: TransactionMocks = {}) {
	vi.mocked(db.transaction).mockImplementation(
		createDbTransactionMock({ insert, select, update }) as never,
	)
	return { insert, select, update }
}

function injectWebhook(
	app: FastifyInstance,
	payload: unknown,
	token: string | null = env.ASAAS_WEBHOOK_TOKEN,
) {
	return app.inject({
		method: 'POST',
		url: '/billing/webhook',
		payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
		headers: {
			'content-type': 'application/json',
			...(token !== null && { 'asaas-access-token': token }),
		},
	})
}

function subscriptionUpdateCalls(update: ReturnType<typeof vi.fn>) {
	return update.mock.results
		.map((result) => result.value.set.mock.calls[0]?.[0])
		.filter((values) => values && !('processedAt' in values))
}

describe('POST /billing/webhook', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it.each([
		['ausente', null],
		['vazio', ''],
		['errado com o mesmo tamanho', `${env.ASAAS_WEBHOOK_TOKEN.slice(0, -1)}#`],
		['de tamanho diferente', 'token-curto'],
	])(
		'retorna 401 e não abre transação quando o token está %s',
		async (_label, token) => {
			vi.spyOn(console, 'error').mockImplementation(() => {})

			const response = await injectWebhook(
				app,
				{ id: 'evt_x', event: 'PAYMENT_RECEIVED' },
				token,
			)

			expect(response.statusCode).toBe(401)
			expect(response.json()).toEqual({
				code: 'INVALID_WEBHOOK_TOKEN',
				message: 'Token do webhook inválido.',
			})
			expect(db.transaction).not.toHaveBeenCalled()
		},
	)

	it('retorna 200 sem abrir transação quando o corpo não é JSON válido', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})

		const response = await injectWebhook(app, '{nao-e-json')

		expect(response.statusCode).toBe(200)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('credita o pacote avulso com referenceId = payment.id quando recebe PAYMENT_RECEIVED de PIX', async () => {
		const { insert, select, update } = mockTransaction({
			insert: vi
				.fn()
				.mockReturnValueOnce(createDbChain([{ id: 'be_1' }]))
				.mockReturnValueOnce(createDbChain([])),
			select: vi
				.fn()
				.mockReturnValueOnce(createDbChain([]))
				.mockReturnValueOnce(
					createDbChain([
						{
							id: 'plan_1',
							slug: 'avulso',
							name: 'Avulso',
							priceCents: 1990,
							creditsGranted: 10,
						},
					]),
				),
		})

		const response = await injectWebhook(app, {
			id: 'evt_pix_1',
			event: 'PAYMENT_RECEIVED',
			payment: {
				id: 'pay_pix_1',
				billingType: 'PIX',
				value: 19.9,
				externalReference: 'user_1:avulso',
			},
		})

		expect(response.statusCode).toBe(200)
		expect(insert.mock.results[0].value.values).toHaveBeenCalledWith(
			expect.objectContaining({
				asaasEventId: 'evt_pix_1',
				asaasPaymentId: 'pay_pix_1',
				eventType: 'PAYMENT_RECEIVED',
			}),
		)
		expect(insert.mock.results[1].value.values).toHaveBeenCalledWith({
			userId: 'user_1',
			delta: 10,
			source: 'purchase',
			referenceId: 'pay_pix_1',
		})
		expect(update.mock.results[0].value.set).toHaveBeenCalledWith({
			processedAt: expect.any(Date),
		})
		expect(select).toHaveBeenCalledTimes(2)
		expect(db.select).not.toHaveBeenCalled()
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'payment_received',
			userId: 'user_1',
			planName: 'Avulso',
			priceCents: 1990,
		})
	})

	it('não reprocessa quando o mesmo evento é reenviado (idempotência por evento)', async () => {
		const { select, update } = mockTransaction({
			insert: vi.fn().mockReturnValueOnce(createDbChain([])),
		})

		const response = await injectWebhook(app, {
			id: 'evt_duplicado',
			event: 'PAYMENT_RECEIVED',
			payment: { id: 'pay_dup', externalReference: 'user_1:avulso' },
		})

		expect(response.statusCode).toBe(200)
		expect(select).not.toHaveBeenCalled()
		expect(update).not.toHaveBeenCalled()
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('aplica a renovação só uma vez quando PAYMENT_RECEIVED chega depois do PAYMENT_CONFIRMED do mesmo pagamento', async () => {
		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ id: 'sub_local' }]) as never,
		)
		const { insert, select, update } = mockTransaction({
			select: vi
				.fn()
				.mockReturnValueOnce(createDbChain([{ id: 'be_confirmed' }])),
		})

		const response = await injectWebhook(app, {
			id: 'evt_received',
			event: 'PAYMENT_RECEIVED',
			payment: {
				id: 'pay_card_1',
				billingType: 'CREDIT_CARD',
				value: 39.9,
				subscription: 'sub_asaas_1',
			},
		})

		expect(response.statusCode).toBe(200)
		expect(insert).toHaveBeenCalledTimes(1)
		expect(select).toHaveBeenCalledTimes(1)
		expect(update).toHaveBeenCalledTimes(1)
		expect(update.mock.results[0].value.set).toHaveBeenCalledWith({
			processedAt: expect.any(Date),
		})
		expect(getAsaasSubscription).not.toHaveBeenCalled()
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('ativa uma nova assinatura resolvendo o dono via GET /subscriptions quando o pagamento não traz externalReference', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)
		vi.mocked(getAsaasSubscription).mockResolvedValue({
			id: 'sub_asaas_new',
			externalReference: 'user_1:essencial',
			status: 'ACTIVE',
		})
		const { insert } = mockTransaction({
			insert: vi
				.fn()
				.mockReturnValueOnce(createDbChain([{ id: 'be_1' }]))
				.mockReturnValueOnce(createDbChain([])),
			select: vi
				.fn()
				.mockReturnValueOnce(createDbChain([]))
				.mockReturnValueOnce(createDbChain([]))
				.mockReturnValueOnce(
					createDbChain([
						{
							id: 'plan_essencial',
							slug: 'essencial',
							name: 'Essencial',
							priceCents: 3990,
						},
					]),
				),
		})

		const response = await injectWebhook(app, {
			id: 'evt_first_payment',
			event: 'PAYMENT_CONFIRMED',
			payment: {
				id: 'pay_first',
				billingType: 'CREDIT_CARD',
				value: 39.9,
				subscription: 'sub_asaas_new',
			},
		})

		expect(response.statusCode).toBe(200)
		expect(getAsaasSubscription).toHaveBeenCalledWith('sub_asaas_new')
		expect(insert.mock.results[1].value.values).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user_1',
				planId: 'plan_essencial',
				status: 'active',
				asaasSubscriptionId: 'sub_asaas_new',
			}),
		)
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'payment_received',
			userId: 'user_1',
			planName: 'Essencial',
			priceCents: 3990,
		})
	})

	it('usa o externalReference do pagamento sem consultar o Asaas quando ele está presente', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)
		const { insert } = mockTransaction({
			insert: vi
				.fn()
				.mockReturnValueOnce(createDbChain([{ id: 'be_1' }]))
				.mockReturnValueOnce(createDbChain([])),
			select: vi
				.fn()
				.mockReturnValueOnce(createDbChain([]))
				.mockReturnValueOnce(createDbChain([]))
				.mockReturnValueOnce(
					createDbChain([{ id: 'plan_pro', name: 'Pro', priceCents: 9990 }]),
				),
		})

		const response = await injectWebhook(app, {
			id: 'evt_first_payment_ref',
			event: 'PAYMENT_CONFIRMED',
			payment: {
				id: 'pay_first_ref',
				value: 99.9,
				subscription: 'sub_asaas_ref',
				externalReference: 'user_2:pro',
			},
		})

		expect(response.statusCode).toBe(200)
		expect(getAsaasSubscription).not.toHaveBeenCalled()
		expect(insert.mock.results[1].value.values).toHaveBeenCalledWith(
			expect.objectContaining({ userId: 'user_2', planId: 'plan_pro' }),
		)
	})

	it('retorna erro sem gravar nada quando a consulta da assinatura no Asaas falha', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)
		vi.mocked(getAsaasSubscription).mockRejectedValue(
			new BillingProviderError(),
		)

		const response = await injectWebhook(app, {
			id: 'evt_first_payment_fail',
			event: 'PAYMENT_CONFIRMED',
			payment: { id: 'pay_fail', subscription: 'sub_asaas_fail' },
		})

		expect(response.statusCode).toBeGreaterThanOrEqual(500)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('promove o pendingPlanId ao renovar quando o valor cobrado corresponde ao plano pendente', async () => {
		const subscription = makeSubscription({
			planId: 'plan_essencial',
			pendingPlanId: 'plan_pro',
			asaasSubscriptionId: 'sub_asaas_1',
		})

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ id: subscription.id }]) as never,
		)
		const { update } = mockTransaction({
			select: vi
				.fn()
				.mockReturnValueOnce(createDbChain([]))
				.mockReturnValueOnce(createDbChain([subscription]))
				.mockReturnValueOnce(
					createDbChain([
						{ id: 'plan_essencial', priceCents: 3990 },
						{ id: 'plan_pro', priceCents: 9990 },
					]),
				),
		})

		const response = await injectWebhook(app, {
			id: 'evt_renewal_upgrade',
			event: 'PAYMENT_RECEIVED',
			payment: { id: 'pay_renewal', value: 99.9, subscription: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		expect(subscriptionUpdateCalls(update)).toEqual([
			expect.objectContaining({
				status: 'active',
				planId: 'plan_pro',
				pendingPlanId: null,
			}),
		])
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('não promove o pendingPlanId quando o valor cobrado ainda é o do plano antigo (upgrade sem recobrança)', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		const subscription = makeSubscription({
			planId: 'plan_essencial',
			pendingPlanId: 'plan_pro',
			asaasSubscriptionId: 'sub_asaas_1',
		})

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ id: subscription.id }]) as never,
		)
		const { update } = mockTransaction({
			select: vi
				.fn()
				.mockReturnValueOnce(createDbChain([]))
				.mockReturnValueOnce(createDbChain([subscription]))
				.mockReturnValueOnce(
					createDbChain([
						{ id: 'plan_essencial', priceCents: 3990 },
						{ id: 'plan_pro', priceCents: 9990 },
					]),
				),
		})

		const response = await injectWebhook(app, {
			id: 'evt_renewal_no_upgrade',
			event: 'PAYMENT_RECEIVED',
			payment: {
				id: 'pay_renewal_2',
				value: 39.9,
				subscription: 'sub_asaas_1',
			},
		})

		expect(response.statusCode).toBe(200)
		expect(subscriptionUpdateCalls(update)).toEqual([
			expect.objectContaining({
				planId: 'plan_essencial',
				pendingPlanId: 'plan_pro',
			}),
		])
	})

	it('não reativa uma assinatura local já cancelada quando chega um pagamento', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const subscription = makeSubscription({
			status: 'canceled',
			asaasSubscriptionId: 'sub_asaas_1',
		})

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ id: subscription.id }]) as never,
		)
		const { update } = mockTransaction({
			select: vi
				.fn()
				.mockReturnValueOnce(createDbChain([]))
				.mockReturnValueOnce(createDbChain([subscription])),
		})

		const response = await injectWebhook(app, {
			id: 'evt_paid_canceled',
			event: 'PAYMENT_CONFIRMED',
			payment: { id: 'pay_late', value: 39.9, subscription: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		expect(subscriptionUpdateCalls(update)).toEqual([])
		expect(warn).toHaveBeenCalled()
	})

	it('marca past_due e envia e-mail de falha quando recebe PAYMENT_OVERDUE de assinatura', async () => {
		const subscription = makeSubscription({
			userId: 'user_1',
			asaasSubscriptionId: 'sub_asaas_1',
			cancelAtPeriodEnd: false,
		})
		const { update } = mockTransaction({
			select: vi.fn().mockReturnValueOnce(createDbChain([subscription])),
		})

		const response = await injectWebhook(app, {
			id: 'evt_overdue',
			event: 'PAYMENT_OVERDUE',
			payment: { id: 'pay_overdue', subscription: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		expect(subscriptionUpdateCalls(update)).toEqual([
			{ status: 'past_due', updatedAt: expect.any(Date) },
		])
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'payment_failed',
			userId: 'user_1',
		})
	})

	it('ignora PAYMENT_OVERDUE de assinatura com cancelamento agendado', async () => {
		const subscription = makeSubscription({
			asaasSubscriptionId: 'sub_asaas_1',
			cancelAtPeriodEnd: true,
		})
		const { update } = mockTransaction({
			select: vi.fn().mockReturnValueOnce(createDbChain([subscription])),
		})

		const response = await injectWebhook(app, {
			id: 'evt_overdue_cancel',
			event: 'PAYMENT_OVERDUE',
			payment: { id: 'pay_overdue_2', subscription: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		expect(subscriptionUpdateCalls(update)).toEqual([])
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it.each([
		['cancelamento agendado por nós', { cancelAtPeriodEnd: true }],
		['assinatura já cancelada', { status: 'canceled' as const }],
	])(
		'não faz nada quando SUBSCRIPTION_DELETED chega após %s',
		async (_label, overrides) => {
			const subscription = makeSubscription({
				asaasSubscriptionId: 'sub_asaas_1',
				...overrides,
			})
			const { update } = mockTransaction({
				select: vi.fn().mockReturnValueOnce(createDbChain([subscription])),
			})

			const response = await injectWebhook(app, {
				id: 'evt_deleted_ours',
				event: 'SUBSCRIPTION_DELETED',
				subscription: { id: 'sub_asaas_1' },
			})

			expect(response.statusCode).toBe(200)
			expect(subscriptionUpdateCalls(update)).toEqual([])
			expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
		},
	)

	it('cancela e notifica quando a assinatura é excluída pelo painel do Asaas', async () => {
		const subscription = makeSubscription({
			userId: 'user_1',
			asaasSubscriptionId: 'sub_asaas_1',
			cancelAtPeriodEnd: false,
		})
		const { update } = mockTransaction({
			select: vi.fn().mockReturnValueOnce(createDbChain([subscription])),
		})

		const response = await injectWebhook(app, {
			id: 'evt_deleted_panel',
			event: 'SUBSCRIPTION_DELETED',
			subscription: { id: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		expect(subscriptionUpdateCalls(update)).toEqual([
			{ status: 'canceled', updatedAt: expect.any(Date) },
		])
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'subscription_canceled',
			userId: 'user_1',
		})
	})

	it('retorna 200 e registra warn quando o evento não é tratado', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const { update } = mockTransaction()

		const response = await injectWebhook(app, {
			id: 'evt_unknown',
			event: 'PAYMENT_CREATED',
			payment: { id: 'pay_created' },
		})

		expect(response.statusCode).toBe(200)
		expect(warn).toHaveBeenCalledWith(
			'[billing webhook] Evento recebido sem tratamento mapeado.',
			{
				eventId: 'evt_unknown',
				event: 'PAYMENT_CREATED',
				paymentId: 'pay_created',
				asaasSubscriptionId: undefined,
			},
		)
		expect(update).toHaveBeenCalledTimes(1)
	})
})
