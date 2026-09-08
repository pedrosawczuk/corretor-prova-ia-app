import { createHmac } from 'node:crypto'
import {
	billingEventsTable,
	correctionCreditsTable,
	db,
	subscriptionsTable,
} from '@app/db'
import { env } from '@app/env'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { sendBillingNotificationEmail } from './send-billing-notification-email'

vi.mock('./send-billing-notification-email', () => ({
	sendBillingNotificationEmail: vi.fn().mockResolvedValue(undefined),
}))

function sign(body: string) {
	return createHmac('sha256', env.ABACATEPAY_WEBHOOK_SECRET)
		.update(Buffer.from(body, 'utf8'))
		.digest('base64')
}

function injectWebhook(app: FastifyInstance, body: string, signature?: string) {
	return app.inject({
		method: 'POST',
		url: '/billing/webhook',
		payload: body,
		headers: {
			'content-type': 'application/json',
			...(signature !== undefined && { 'x-webhook-signature': signature }),
		},
	})
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

	it('retorna 401 e não abre transação quando a assinatura é inválida', async () => {
		const body = JSON.stringify({
			id: 'evt_invalid',
			event: 'checkout.completed',
			data: {},
		})

		const response = await injectWebhook(app, body, 'assinatura-invalida')

		expect(response.statusCode).toBe(401)
		expect(db.transaction).not.toHaveBeenCalled()
	})

	it('credita o pacote avulso quando recebe checkout.completed novo', async () => {
		const body = JSON.stringify({
			id: 'evt_checkout_1',
			event: 'checkout.completed',
			data: {
				id: 'bill_abc',
				metadata: { userId: 'user_1', planSlug: 'avulso' },
			},
		})

		const insert = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: 'be_1' }]))
			.mockReturnValueOnce(createDbChain([{ id: 'cc_1' }]))
		const select = vi
			.fn()
			.mockReturnValueOnce(
				createDbChain([{ id: 'plan_1', slug: 'avulso', creditsGranted: 10 }]),
			)
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		expect(insert).toHaveBeenNthCalledWith(2, correctionCreditsTable)

		const creditsChain = insert.mock.results[1].value
		expect(creditsChain.values).toHaveBeenCalledWith({
			userId: 'user_1',
			delta: 10,
			source: 'purchase',
			referenceId: 'bill_abc',
		})
		expect(update).toHaveBeenCalledWith(billingEventsTable)
	})

	it('não reprocessa quando o evento já foi registrado (idempotência)', async () => {
		const body = JSON.stringify({
			id: 'evt_duplicado',
			event: 'checkout.completed',
			data: {
				id: 'bill_dup',
				metadata: { userId: 'user_1', planSlug: 'avulso' },
			},
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([]))
		const select = vi.fn()
		const update = vi.fn()

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		expect(insert).toHaveBeenCalledTimes(1)
		expect(select).not.toHaveBeenCalled()
		expect(update).not.toHaveBeenCalled()
	})

	it('ativa uma nova assinatura quando recebe subscription.completed', async () => {
		const body = JSON.stringify({
			id: 'evt_sub_1',
			event: 'subscription.completed',
			data: {
				id: 'subs_abc',
				metadata: { userId: 'user_2', planSlug: 'essencial' },
			},
		})

		const insert = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: 'be_2' }]))
			.mockReturnValueOnce(createDbChain([{ id: 'sub_1' }]))
		const select = vi
			.fn()
			.mockReturnValueOnce(createDbChain([]))
			.mockReturnValueOnce(createDbChain([{ id: 'plan_2', slug: 'essencial' }]))
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		expect(insert).toHaveBeenNthCalledWith(2, subscriptionsTable)

		const subscriptionChain = insert.mock.results[1].value
		expect(subscriptionChain.values).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user_2',
				planId: 'plan_2',
				status: 'active',
				abacatepayBillingId: 'subs_abc',
			}),
		)
	})

	it('estende o período de uma assinatura existente quando recebe subscription.renewed', async () => {
		const body = JSON.stringify({
			id: 'evt_sub_2',
			event: 'subscription.renewed',
			data: { id: 'subs_abc' },
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_3' }]))
		const select = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'sub_1' }]))
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		expect(update).toHaveBeenNthCalledWith(1, subscriptionsTable)

		const subscriptionUpdateChain = update.mock.results[0].value
		expect(subscriptionUpdateChain.set).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'active' }),
		)
	})

	it('promove o pendingPlanId ao renovar quando o valor cobrado corresponde ao plano pendente (upgrade)', async () => {
		const body = JSON.stringify({
			id: 'evt_sub_3',
			event: 'subscription.renewed',
			data: { id: 'subs_abc', amount: 9990 },
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_5' }]))
		const select = vi
			.fn()
			.mockReturnValueOnce(
				createDbChain([
					{ id: 'sub_1', planId: 'plan_essencial', pendingPlanId: 'plan_pro' },
				]),
			)
			.mockReturnValueOnce(
				createDbChain([
					{ id: 'plan_essencial', priceCents: 3990 },
					{ id: 'plan_pro', priceCents: 9990 },
				]),
			)
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		const subscriptionUpdateChain = update.mock.results[0].value
		expect(subscriptionUpdateChain.set).toHaveBeenCalledWith(
			expect.objectContaining({ planId: 'plan_pro', pendingPlanId: null }),
		)
	})

	it('não promove o pendingPlanId ao renovar quando o valor cobrado ainda é o do plano antigo (upgrade sem recobrança)', async () => {
		const body = JSON.stringify({
			id: 'evt_sub_4',
			event: 'subscription.renewed',
			data: { id: 'subs_abc', amount: 3990 },
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_9' }]))
		const select = vi
			.fn()
			.mockReturnValueOnce(
				createDbChain([
					{ id: 'sub_1', planId: 'plan_essencial', pendingPlanId: 'plan_pro' },
				]),
			)
			.mockReturnValueOnce(
				createDbChain([
					{ id: 'plan_essencial', priceCents: 3990 },
					{ id: 'plan_pro', priceCents: 9990 },
				]),
			)
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const warnSpy = vi
			.spyOn(console, 'warn')
			.mockImplementation(() => undefined)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		const subscriptionUpdateChain = update.mock.results[0].value
		expect(subscriptionUpdateChain.set).toHaveBeenCalledWith(
			expect.objectContaining({
				planId: 'plan_essencial',
				pendingPlanId: 'plan_pro',
			}),
		)
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('não promovida'),
			expect.objectContaining({ eventId: 'evt_sub_4' }),
		)

		warnSpy.mockRestore()
	})

	it('promove o pendingPlanId ao renovar mesmo sem o valor cobrado mudar quando é um downgrade (bloco 7.2)', async () => {
		const body = JSON.stringify({
			id: 'evt_sub_5',
			event: 'subscription.renewed',
			data: { id: 'subs_abc', amount: 9990 },
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_10' }]))
		const select = vi
			.fn()
			.mockReturnValueOnce(
				createDbChain([
					{
						id: 'sub_1',
						planId: 'plan_pro',
						pendingPlanId: 'plan_essencial',
					},
				]),
			)
			.mockReturnValueOnce(
				createDbChain([
					{ id: 'plan_pro', priceCents: 9990 },
					{ id: 'plan_essencial', priceCents: 3990 },
				]),
			)
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		const subscriptionUpdateChain = update.mock.results[0].value
		expect(subscriptionUpdateChain.set).toHaveBeenCalledWith(
			expect.objectContaining({
				planId: 'plan_essencial',
				pendingPlanId: null,
			}),
		)
	})

	it('marca a assinatura como past_due quando o cancelamento é por falha de pagamento (bloco 8.1)', async () => {
		const body = JSON.stringify({
			id: 'evt_cancel_1',
			event: 'subscription.cancelled',
			data: { id: 'subs_abc', cancelledDueTo: 'max_payment_retries_exceeded' },
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_6' }]))
		const select = vi.fn().mockReturnValueOnce(
			createDbChain([
				{
					id: 'sub_1',
					userId: 'user_1',
					cancelAtPeriodEnd: false,
				},
			]),
		)
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		const subscriptionUpdateChain = update.mock.results[0].value
		expect(subscriptionUpdateChain.set).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'past_due' }),
		)
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'payment_failed',
			userId: 'user_1',
		})
	})

	it('cancela a assinatura quando o cancelamento não é automático por falha de pagamento (bloco 8.1)', async () => {
		const body = JSON.stringify({
			id: 'evt_cancel_2',
			event: 'subscription.cancelled',
			data: { id: 'subs_abc' },
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_7' }]))
		const select = vi.fn().mockReturnValueOnce(
			createDbChain([
				{
					id: 'sub_1',
					userId: 'user_1',
					cancelAtPeriodEnd: false,
				},
			]),
		)
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		const subscriptionUpdateChain = update.mock.results[0].value
		expect(subscriptionUpdateChain.set).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'canceled' }),
		)
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'subscription_canceled',
			userId: 'user_1',
		})
	})

	it('não faz nada quando subscription.cancelled chega para um cancelamento já iniciado por nós', async () => {
		const body = JSON.stringify({
			id: 'evt_cancel_3',
			event: 'subscription.cancelled',
			data: { id: 'subs_abc' },
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_8' }]))
		const select = vi.fn().mockReturnValueOnce(
			createDbChain([
				{
					id: 'sub_1',
					userId: 'user_1',
					cancelAtPeriodEnd: true,
				},
			]),
		)
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		expect(update).toHaveBeenCalledTimes(1)
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('loga um aviso e responde 200 para eventos sem tratamento mapeado', async () => {
		const body = JSON.stringify({
			id: 'evt_unmapped',
			event: 'checkout.refunded',
			data: {},
		})

		const insert = vi.fn().mockReturnValueOnce(createDbChain([{ id: 'be_4' }]))
		const select = vi.fn()
		const update = vi.fn().mockReturnValue(createDbChain([]))

		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock({ insert, select, update }) as never,
		)

		const warnSpy = vi
			.spyOn(console, 'warn')
			.mockImplementation(() => undefined)

		const response = await injectWebhook(app, body, sign(body))

		expect(response.statusCode).toBe(200)
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('sem tratamento mapeado'),
			expect.objectContaining({ event: 'checkout.refunded' }),
		)

		warnSpy.mockRestore()
	})
})
