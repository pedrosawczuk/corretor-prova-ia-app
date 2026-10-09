import { eq, subscriptionsTable } from '@app/db'
import type { BillingTransaction } from './billing-transaction'
import type { BillingNotification } from './send-billing-notification-email'

interface HandleSubscriptionDeletedWebhookParams {
	eventId: string
	asaasSubscriptionId: string | undefined
}

export async function handleSubscriptionDeletedWebhook(
	tx: BillingTransaction,
	{ eventId, asaasSubscriptionId }: HandleSubscriptionDeletedWebhookParams,
): Promise<BillingNotification | null> {
	if (!asaasSubscriptionId) {
		console.error(
			'[billing webhook] SUBSCRIPTION_DELETED sem subscription.id.',
			{
				eventId,
			},
		)
		return null
	}

	const [existingSubscription] = await tx
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.asaasSubscriptionId, asaasSubscriptionId))

	if (!existingSubscription) {
		console.error(
			'[billing webhook] SUBSCRIPTION_DELETED para assinatura desconhecida.',
			{ eventId, asaasSubscriptionId },
		)
		return null
	}

	if (
		existingSubscription.status === 'canceled' ||
		existingSubscription.cancelAtPeriodEnd
	) {
		return null
	}

	await tx
		.update(subscriptionsTable)
		.set({ status: 'canceled', updatedAt: new Date() })
		.where(eq(subscriptionsTable.id, existingSubscription.id))

	return { type: 'subscription_canceled', userId: existingSubscription.userId }
}
