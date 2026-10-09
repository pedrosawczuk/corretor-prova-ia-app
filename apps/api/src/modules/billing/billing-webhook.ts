import { billingEventsTable, db, eq } from '@app/db'
import { env } from '@app/env'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { fromAsaasValue } from '@/lib/billing/to-asaas-value'
import { verifyAsaasWebhookToken } from '@/lib/billing/verify-asaas-webhook-token'
import type { BillingTransaction } from './billing-transaction'
import {
	type BillingWebhookPayload,
	billingWebhookPayloadSchema,
} from './billing-webhook-schema'
import { handleOneTimePaymentWebhook } from './handle-one-time-payment-webhook'
import { handlePaymentOverdueWebhook } from './handle-payment-overdue-webhook'
import { handleSubscriptionDeletedWebhook } from './handle-subscription-deleted-webhook'
import { handleSubscriptionPaymentWebhook } from './handle-subscription-payment-webhook'
import { isPaymentAlreadyProcessed } from './is-payment-already-processed'
import { PAID_PAYMENT_EVENTS } from './paid-payment-events'
import { resolveSubscriptionPaymentOwner } from './resolve-subscription-payment-owner'
import {
	type BillingNotification,
	sendBillingNotificationEmail,
} from './send-billing-notification-email'

type SubscriptionOwner = Awaited<
	ReturnType<typeof resolveSubscriptionPaymentOwner>
>

interface WebhookEventContext {
	payload: BillingWebhookPayload
	paymentId: string | undefined
	asaasSubscriptionId: string | undefined
	subscriptionOwner: SubscriptionOwner
}

function extractStringField(
	data: Record<string, unknown> | undefined,
	field: string,
) {
	const value = data?.[field]
	return typeof value === 'string' ? value : undefined
}

function extractNumberField(
	data: Record<string, unknown> | undefined,
	field: string,
) {
	const value = data?.[field]
	return typeof value === 'number' ? value : undefined
}

function handleWebhookEvent(
	tx: BillingTransaction,
	{
		payload,
		paymentId,
		asaasSubscriptionId,
		subscriptionOwner,
	}: WebhookEventContext,
): Promise<BillingNotification | null> {
	const eventId = payload.id

	switch (payload.event) {
		case 'PAYMENT_CONFIRMED':
		case 'PAYMENT_RECEIVED': {
			if (!asaasSubscriptionId) {
				return handleOneTimePaymentWebhook(tx, {
					eventId,
					paymentId,
					externalReference: extractStringField(
						payload.payment,
						'externalReference',
					),
				})
			}

			const chargedValue = extractNumberField(payload.payment, 'value')

			return handleSubscriptionPaymentWebhook(tx, {
				eventId,
				asaasSubscriptionId,
				chargedAmountCents:
					chargedValue === undefined ? undefined : fromAsaasValue(chargedValue),
				owner: subscriptionOwner,
			})
		}

		case 'PAYMENT_OVERDUE':
			return handlePaymentOverdueWebhook(tx, {
				eventId,
				paymentId,
				asaasSubscriptionId,
			})

		case 'SUBSCRIPTION_DELETED':
			return handleSubscriptionDeletedWebhook(tx, {
				eventId,
				asaasSubscriptionId,
			})

		default:
			console.warn(
				'[billing webhook] Evento recebido sem tratamento mapeado.',
				{ eventId, event: payload.event, paymentId, asaasSubscriptionId },
			)
			return Promise.resolve(null)
	}
}

export async function billingWebhookModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const tokenHeader = request.headers['asaas-access-token']
	const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader

	if (!verifyAsaasWebhookToken(token, env.ASAAS_WEBHOOK_TOKEN)) {
		console.error('[billing webhook] Token inválido recebido.')
		return reply.status(401).send({
			code: 'INVALID_WEBHOOK_TOKEN',
			message: 'Token do webhook inválido.',
		})
	}

	const rawBody = (request.body as Buffer).toString('utf8')

	let json: unknown
	try {
		json = JSON.parse(rawBody)
	} catch {
		console.error('[billing webhook] Corpo do webhook não é um JSON válido.')
		return reply.status(200).send({ received: true })
	}

	const parsed = billingWebhookPayloadSchema.safeParse(json)

	if (!parsed.success) {
		console.error(
			'[billing webhook] Payload fora do formato esperado.',
			parsed.error.issues,
		)
		return reply.status(200).send({ received: true })
	}

	const payload = parsed.data
	const paymentId = extractStringField(payload.payment, 'id')
	const asaasSubscriptionId = payload.event.startsWith('SUBSCRIPTION_')
		? extractStringField(payload.subscription, 'id')
		: extractStringField(payload.payment, 'subscription')
	const isPaidEvent = PAID_PAYMENT_EVENTS.includes(payload.event)

	const subscriptionOwner =
		isPaidEvent && asaasSubscriptionId
			? await resolveSubscriptionPaymentOwner({
					asaasSubscriptionId,
					paymentExternalReference: extractStringField(
						payload.payment,
						'externalReference',
					),
				})
			: null

	const notification = await db.transaction(async (tx) => {
		const [inserted] = await tx
			.insert(billingEventsTable)
			.values({
				asaasEventId: payload.id,
				asaasPaymentId: paymentId ?? null,
				eventType: payload.event,
				payload: json,
			})
			.onConflictDoNothing({ target: billingEventsTable.asaasEventId })
			.returning({ id: billingEventsTable.id })

		if (!inserted) return null

		const alreadyProcessed =
			isPaidEvent && paymentId
				? await isPaymentAlreadyProcessed(tx, {
						paymentId,
						billingEventId: inserted.id,
					})
				: false

		const result = alreadyProcessed
			? null
			: await handleWebhookEvent(tx, {
					payload,
					paymentId,
					asaasSubscriptionId,
					subscriptionOwner,
				})

		await tx
			.update(billingEventsTable)
			.set({ processedAt: new Date() })
			.where(eq(billingEventsTable.id, inserted.id))

		return result
	})

	if (notification) {
		await sendBillingNotificationEmail(notification).catch((error) => {
			console.error(
				'[billing webhook] Falha ao enviar e-mail de notificação de cobrança.',
				error,
			)
		})
	}

	return reply.status(200).send({ received: true })
}
