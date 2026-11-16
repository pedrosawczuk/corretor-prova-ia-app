import {
	and,
	billingEventsTable,
	eq,
	inArray,
	isNotNull,
	subscriptionsTable,
} from '@app/db'
import type { BillingTransaction } from './billing-transaction'
import { PAID_PAYMENT_EVENTS } from './paid-payment-events'
import type { BillingNotification } from './send-billing-notification-email'

interface HandlePaymentOverdueWebhookParams {
	eventId: string
	paymentId: string | undefined
	asaasSubscriptionId: string | undefined
	paymentDueDate?: string
}

function isStaleOverdueDate(
	paymentDueDate: string | undefined,
	currentPeriodStart: Date,
): boolean {
	if (!paymentDueDate) return false
	const normalized = /^\d{4}-\d{2}-\d{2}$/.test(paymentDueDate)
		? `${paymentDueDate}T23:59:59.999Z`
		: paymentDueDate
	const dueTime = new Date(normalized).getTime()
	if (Number.isNaN(dueTime)) return false
	return dueTime < currentPeriodStart.getTime()
}

export async function handlePaymentOverdueWebhook(
	tx: BillingTransaction,
	{
		eventId,
		paymentId,
		asaasSubscriptionId,
		paymentDueDate,
	}: HandlePaymentOverdueWebhookParams,
): Promise<BillingNotification | null> {
	if (!asaasSubscriptionId) {
		console.warn(
			'[billing webhook] Cobrança avulsa vencida sem assinatura vinculada.',
			{ eventId, paymentId },
		)
		return null
	}

	const [existingSubscription] = await tx
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.asaasSubscriptionId, asaasSubscriptionId))

	if (!existingSubscription) {
		console.warn(
			'[billing webhook] PAYMENT_OVERDUE para assinatura desconhecida.',
			{ eventId, paymentId, asaasSubscriptionId },
		)
		return null
	}

	if (
		existingSubscription.status !== 'active' ||
		existingSubscription.cancelAtPeriodEnd
	) {
		return null
	}

	if (paymentId) {
		const [alreadyPaid] = await tx
			.select({ id: billingEventsTable.id })
			.from(billingEventsTable)
			.where(
				and(
					eq(billingEventsTable.asaasPaymentId, paymentId),
					inArray(billingEventsTable.eventType, PAID_PAYMENT_EVENTS),
					isNotNull(billingEventsTable.processedAt),
				),
			)
			.limit(1)

		if (alreadyPaid) {
			return null
		}
	}

	if (
		isStaleOverdueDate(paymentDueDate, existingSubscription.currentPeriodStart)
	) {
		return null
	}

	await tx
		.update(subscriptionsTable)
		.set({ status: 'past_due', updatedAt: new Date() })
		.where(eq(subscriptionsTable.id, existingSubscription.id))

	return { type: 'payment_failed', userId: existingSubscription.userId }
}
