import {
	billingEventsTable,
	correctionCreditsTable,
	db,
	eq,
	subscriptionsTable,
} from '@app/db'
import { env } from '@app/env'
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
import { getAsaasSubscription } from '@/lib/billing/get-asaas-subscription'
import { createTestApp } from '@/test/create-test-app'
import { insertBillingEvent } from '@/test/db-factories/insert-billing-event'
import { insertPlan } from '@/test/db-factories/insert-plan'
import { insertSubscription } from '@/test/db-factories/insert-subscription'
import { insertUser } from '@/test/db-factories/insert-user'
import { sendBillingNotificationEmail } from './send-billing-notification-email'

vi.mock('./send-billing-notification-email', () => ({
	sendBillingNotificationEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/billing/get-asaas-subscription', () => ({
	getAsaasSubscription: vi.fn(),
}))

const DAY_MS = 1000 * 60 * 60 * 24

type User = Awaited<ReturnType<typeof insertUser>>

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

function insertRecurringPlans() {
	return Promise.all([
		insertPlan({ slug: 'essencial', name: 'Essencial', priceCents: 3990 }),
		insertPlan({ slug: 'pro', name: 'Pro', priceCents: 9990 }),
	])
}

function insertStaleSubscription(
	overrides: Parameters<typeof insertSubscription>[0],
) {
	return insertSubscription({
		currentPeriodStart: new Date(Date.now() - 30 * DAY_MS),
		currentPeriodEnd: new Date(Date.now() + DAY_MS),
		updatedAt: new Date(Date.now() - 30 * DAY_MS),
		...overrides,
	})
}

function selectBillingEvents() {
	return db.select().from(billingEventsTable)
}

function selectCredits(userId: string) {
	return db
		.select()
		.from(correctionCreditsTable)
		.where(eq(correctionCreditsTable.userId, userId))
}

function selectSubscriptions(userId: string) {
	return db
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.userId, userId))
}

async function selectSubscription(id: string) {
	const [row] = await db
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.id, id))

	return row
}

describe('POST /billing/webhook (integração)', () => {
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
			expect(await selectBillingEvents()).toHaveLength(0)
		},
	)

	it('retorna 200 sem abrir transação quando o corpo não é JSON válido', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})

		const response = await injectWebhook(app, '{nao-e-json')

		expect(response.statusCode).toBe(200)
		expect(await selectBillingEvents()).toHaveLength(0)
	})

	it('credita o pacote avulso com referenceId = payment.id quando recebe PAYMENT_RECEIVED de PIX', async () => {
		await insertAvulsoPlan()

		const response = await injectWebhook(app, {
			id: 'evt_pix_1',
			event: 'PAYMENT_RECEIVED',
			payment: {
				id: 'pay_pix_1',
				billingType: 'PIX',
				value: 19.9,
				externalReference: `${user.id}:avulso`,
			},
		})

		expect(response.statusCode).toBe(200)
		expect(await selectBillingEvents()).toEqual([
			expect.objectContaining({
				asaasEventId: 'evt_pix_1',
				asaasPaymentId: 'pay_pix_1',
				eventType: 'PAYMENT_RECEIVED',
				processedAt: expect.any(Date),
			}),
		])
		expect(await selectCredits(user.id)).toEqual([
			expect.objectContaining({
				userId: user.id,
				delta: 10,
				source: 'purchase',
				referenceId: 'pay_pix_1',
			}),
		])
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'payment_received',
			userId: user.id,
			planName: 'Avulso',
			priceCents: 1990,
		})
	})

	it('não reprocessa quando o mesmo evento é reenviado (idempotência por evento)', async () => {
		await insertAvulsoPlan()
		await insertBillingEvent({
			asaasEventId: 'evt_duplicado',
			asaasPaymentId: 'pay_dup',
			eventType: 'PAYMENT_RECEIVED',
		})

		const response = await injectWebhook(app, {
			id: 'evt_duplicado',
			event: 'PAYMENT_RECEIVED',
			payment: { id: 'pay_dup', externalReference: `${user.id}:avulso` },
		})

		expect(response.statusCode).toBe(200)
		expect(await selectBillingEvents()).toHaveLength(1)
		expect(await selectCredits(user.id)).toHaveLength(0)
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('gera uma única linha em billing_events e um único crédito quando o mesmo evento chega duas vezes', async () => {
		await insertAvulsoPlan()
		const payload = {
			id: 'evt_repetido',
			event: 'PAYMENT_RECEIVED',
			payment: {
				id: 'pay_repetido',
				billingType: 'PIX',
				value: 19.9,
				externalReference: `${user.id}:avulso`,
			},
		}

		const first = await injectWebhook(app, payload)
		const second = await injectWebhook(app, payload)

		expect(first.statusCode).toBe(200)
		expect(second.statusCode).toBe(200)
		expect(await selectBillingEvents()).toHaveLength(1)
		expect(await selectCredits(user.id)).toHaveLength(1)
		expect(sendBillingNotificationEmail).toHaveBeenCalledTimes(1)
	})

	it('gera um único crédito quando PAYMENT_CONFIRMED e PAYMENT_RECEIVED chegam para o mesmo pagamento avulso', async () => {
		await insertAvulsoPlan()
		const payment = {
			id: 'pay_avulso_dois_eventos',
			billingType: 'PIX',
			value: 19.9,
			externalReference: `${user.id}:avulso`,
		}

		await injectWebhook(app, {
			id: 'evt_avulso_confirmed',
			event: 'PAYMENT_CONFIRMED',
			payment,
		})
		const response = await injectWebhook(app, {
			id: 'evt_avulso_received',
			event: 'PAYMENT_RECEIVED',
			payment,
		})

		expect(response.statusCode).toBe(200)
		expect(await selectBillingEvents()).toHaveLength(2)
		expect(await selectCredits(user.id)).toEqual([
			expect.objectContaining({
				delta: 10,
				referenceId: 'pay_avulso_dois_eventos',
			}),
		])
		expect(sendBillingNotificationEmail).toHaveBeenCalledTimes(1)
	})

	it('aplica a renovação só uma vez quando PAYMENT_RECEIVED chega depois do PAYMENT_CONFIRMED do mesmo pagamento', async () => {
		const subscription = await insertStaleSubscription({
			userId: user.id,
			asaasSubscriptionId: 'sub_asaas_1',
		})
		await insertBillingEvent({
			asaasEventId: 'evt_confirmed',
			asaasPaymentId: 'pay_card_1',
			eventType: 'PAYMENT_CONFIRMED',
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
		expect(await selectSubscription(subscription.id)).toMatchObject({
			currentPeriodStart: subscription.currentPeriodStart,
			currentPeriodEnd: subscription.currentPeriodEnd,
			updatedAt: subscription.updatedAt,
		})
		expect(await selectBillingEvents()).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					asaasEventId: 'evt_received',
					processedAt: expect.any(Date),
				}),
			]),
		)
		expect(getAsaasSubscription).not.toHaveBeenCalled()
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('cria uma única assinatura quando PAYMENT_CONFIRMED e PAYMENT_RECEIVED chegam para o primeiro pagamento', async () => {
		const [essencial] = await insertRecurringPlans()
		const payment = {
			id: 'pay_primeiro',
			billingType: 'CREDIT_CARD',
			value: 39.9,
			subscription: 'sub_asaas_primeiro',
			externalReference: `${user.id}:essencial`,
		}

		await injectWebhook(app, {
			id: 'evt_primeiro_confirmed',
			event: 'PAYMENT_CONFIRMED',
			payment,
		})
		const response = await injectWebhook(app, {
			id: 'evt_primeiro_received',
			event: 'PAYMENT_RECEIVED',
			payment,
		})

		expect(response.statusCode).toBe(200)
		expect(await selectSubscriptions(user.id)).toEqual([
			expect.objectContaining({
				planId: essencial.id,
				status: 'active',
				asaasSubscriptionId: 'sub_asaas_primeiro',
			}),
		])
		expect(sendBillingNotificationEmail).toHaveBeenCalledTimes(1)
	})

	it('ativa uma nova assinatura resolvendo o dono via GET /subscriptions quando o pagamento não traz externalReference', async () => {
		const [essencial] = await insertRecurringPlans()
		vi.mocked(getAsaasSubscription).mockResolvedValue({
			id: 'sub_asaas_new',
			externalReference: `${user.id}:essencial`,
			status: 'ACTIVE',
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
		expect(await selectSubscriptions(user.id)).toEqual([
			expect.objectContaining({
				userId: user.id,
				planId: essencial.id,
				status: 'active',
				asaasSubscriptionId: 'sub_asaas_new',
			}),
		])
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'payment_received',
			userId: user.id,
			planName: 'Essencial',
			priceCents: 3990,
		})
	})

	it('usa o externalReference do pagamento sem consultar o Asaas quando ele está presente', async () => {
		const [, pro] = await insertRecurringPlans()

		const response = await injectWebhook(app, {
			id: 'evt_first_payment_ref',
			event: 'PAYMENT_CONFIRMED',
			payment: {
				id: 'pay_first_ref',
				value: 99.9,
				subscription: 'sub_asaas_ref',
				externalReference: `${user.id}:pro`,
			},
		})

		expect(response.statusCode).toBe(200)
		expect(getAsaasSubscription).not.toHaveBeenCalled()
		expect(await selectSubscriptions(user.id)).toEqual([
			expect.objectContaining({ userId: user.id, planId: pro.id }),
		])
	})

	it('retorna erro sem gravar nada quando a consulta da assinatura no Asaas falha', async () => {
		await insertRecurringPlans()
		vi.mocked(getAsaasSubscription).mockRejectedValue(
			new BillingProviderError(),
		)

		const response = await injectWebhook(app, {
			id: 'evt_first_payment_fail',
			event: 'PAYMENT_CONFIRMED',
			payment: { id: 'pay_fail', subscription: 'sub_asaas_fail' },
		})

		expect(response.statusCode).toBeGreaterThanOrEqual(500)
		expect(await selectBillingEvents()).toHaveLength(0)
		expect(await selectSubscriptions(user.id)).toHaveLength(0)
	})

	it('não deixa duas assinaturas ativas quando o usuário já tem uma ativa e chega o primeiro pagamento de outra (comportamento atual: 500 e nada gravado)', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const [essencial] = await insertRecurringPlans()
		const existing = await insertSubscription({
			userId: user.id,
			planId: essencial.id,
			status: 'active',
			asaasSubscriptionId: 'sub_asaas_antiga',
		})

		const response = await injectWebhook(app, {
			id: 'evt_segunda_assinatura',
			event: 'PAYMENT_CONFIRMED',
			payment: {
				id: 'pay_segunda',
				value: 99.9,
				subscription: 'sub_asaas_segunda',
				externalReference: `${user.id}:pro`,
			},
		})

		expect(response.statusCode).toBe(500)
		expect(await selectSubscriptions(user.id)).toEqual([
			expect.objectContaining({ id: existing.id, status: 'active' }),
		])
		expect(await selectBillingEvents()).toHaveLength(0)
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('promove o pendingPlanId ao renovar quando o valor cobrado corresponde ao plano pendente', async () => {
		const [essencial, pro] = await insertRecurringPlans()
		const subscription = await insertStaleSubscription({
			userId: user.id,
			planId: essencial.id,
			pendingPlanId: pro.id,
			asaasSubscriptionId: 'sub_asaas_1',
		})

		const response = await injectWebhook(app, {
			id: 'evt_renewal_upgrade',
			event: 'PAYMENT_RECEIVED',
			payment: { id: 'pay_renewal', value: 99.9, subscription: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		const renewed = await selectSubscription(subscription.id)
		expect(renewed).toMatchObject({
			status: 'active',
			planId: pro.id,
			pendingPlanId: null,
		})
		expect(renewed.currentPeriodStart.getTime()).toBeGreaterThan(
			subscription.currentPeriodStart.getTime(),
		)
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('não promove o pendingPlanId quando o valor cobrado ainda é o do plano antigo (upgrade sem recobrança)', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		const [essencial, pro] = await insertRecurringPlans()
		const subscription = await insertStaleSubscription({
			userId: user.id,
			planId: essencial.id,
			pendingPlanId: pro.id,
			asaasSubscriptionId: 'sub_asaas_1',
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
		const renewed = await selectSubscription(subscription.id)
		expect(renewed).toMatchObject({
			status: 'active',
			planId: essencial.id,
			pendingPlanId: pro.id,
		})
		expect(renewed.currentPeriodStart.getTime()).toBeGreaterThan(
			subscription.currentPeriodStart.getTime(),
		)
	})

	it('não reativa uma assinatura local já cancelada quando chega um pagamento', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const subscription = await insertStaleSubscription({
			userId: user.id,
			status: 'canceled',
			asaasSubscriptionId: 'sub_asaas_1',
		})

		const response = await injectWebhook(app, {
			id: 'evt_paid_canceled',
			event: 'PAYMENT_CONFIRMED',
			payment: { id: 'pay_late', value: 39.9, subscription: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'canceled',
			updatedAt: subscription.updatedAt,
		})
		expect(warn).toHaveBeenCalled()
	})

	it('marca past_due e envia e-mail de falha quando recebe PAYMENT_OVERDUE de assinatura', async () => {
		const subscription = await insertStaleSubscription({
			userId: user.id,
			asaasSubscriptionId: 'sub_asaas_1',
			cancelAtPeriodEnd: false,
		})

		const response = await injectWebhook(app, {
			id: 'evt_overdue',
			event: 'PAYMENT_OVERDUE',
			payment: { id: 'pay_overdue', subscription: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		const updated = await selectSubscription(subscription.id)
		expect(updated.status).toBe('past_due')
		expect(updated.updatedAt.getTime()).toBeGreaterThan(
			subscription.updatedAt.getTime(),
		)
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'payment_failed',
			userId: user.id,
		})
	})

	it('ignora PAYMENT_OVERDUE de assinatura com cancelamento agendado', async () => {
		const subscription = await insertStaleSubscription({
			userId: user.id,
			asaasSubscriptionId: 'sub_asaas_1',
			cancelAtPeriodEnd: true,
		})

		const response = await injectWebhook(app, {
			id: 'evt_overdue_cancel',
			event: 'PAYMENT_OVERDUE',
			payment: { id: 'pay_overdue_2', subscription: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'active',
			updatedAt: subscription.updatedAt,
		})
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it.each([
		['cancelamento agendado por nós', { cancelAtPeriodEnd: true }],
		['assinatura já cancelada', { status: 'canceled' as const }],
	])(
		'não faz nada quando SUBSCRIPTION_DELETED chega após %s',
		async (_label, overrides) => {
			const subscription = await insertStaleSubscription({
				userId: user.id,
				asaasSubscriptionId: 'sub_asaas_1',
				...overrides,
			})

			const response = await injectWebhook(app, {
				id: 'evt_deleted_ours',
				event: 'SUBSCRIPTION_DELETED',
				subscription: { id: 'sub_asaas_1' },
			})

			expect(response.statusCode).toBe(200)
			expect(await selectSubscription(subscription.id)).toMatchObject({
				status: subscription.status,
				updatedAt: subscription.updatedAt,
			})
			expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
		},
	)

	it('cancela e notifica quando a assinatura é excluída pelo painel do Asaas', async () => {
		const subscription = await insertStaleSubscription({
			userId: user.id,
			asaasSubscriptionId: 'sub_asaas_1',
			cancelAtPeriodEnd: false,
		})

		const response = await injectWebhook(app, {
			id: 'evt_deleted_panel',
			event: 'SUBSCRIPTION_DELETED',
			subscription: { id: 'sub_asaas_1' },
		})

		expect(response.statusCode).toBe(200)
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'canceled',
		})
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'subscription_canceled',
			userId: user.id,
		})
	})

	it('retorna 200 e registra warn quando o evento não é tratado', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

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
		expect(await selectBillingEvents()).toEqual([
			expect.objectContaining({
				asaasEventId: 'evt_unknown',
				processedAt: expect.any(Date),
			}),
		])
	})
})
