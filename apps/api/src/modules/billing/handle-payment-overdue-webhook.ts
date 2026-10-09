import { eq, subscriptionsTable } from '@app/db'
import type { BillingTransaction } from './billing-transaction'
import type { BillingNotification } from './send-billing-notification-email'

interface HandlePaymentOverdueWebhookParams {
	eventId: string
	paymentId: string | undefined
	asaasSubscriptionId: string | undefined
}

export async function handlePaymentOverdueWebhook(
	tx: BillingTransaction,
	{
		eventId,
		paymentId,
		asaasSubscriptionId,
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

	await tx
		.update(subscriptionsTable)
		.set({ status: 'past_due', updatedAt: new Date() })
		.where(eq(subscriptionsTable.id, existingSubscription.id))

	return { type: 'payment_failed', userId: existingSubscription.userId }
}
