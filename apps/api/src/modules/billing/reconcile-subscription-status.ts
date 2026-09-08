import { db, eq, subscriptionsTable } from '@app/db'
import { sendBillingNotificationEmail } from './send-billing-notification-email'

const PAST_DUE_GRACE_PERIOD_DAYS = 3

function addDays(date: Date, days: number) {
	const next = new Date(date)
	next.setDate(next.getDate() + days)
	return next
}

interface ReconcilableSubscription {
	id: string
	userId: string
	status: 'active' | 'past_due' | 'canceled'
	cancelAtPeriodEnd: boolean
	currentPeriodEnd: Date
	updatedAt: Date
}

export async function reconcileSubscriptionStatus<
	T extends ReconcilableSubscription,
>(subscription: T): Promise<T> {
	const now = new Date()

	const periodEndedWithCancellation =
		subscription.status === 'active' &&
		subscription.cancelAtPeriodEnd &&
		subscription.currentPeriodEnd <= now

	const pastDueGracePeriodExpired =
		subscription.status === 'past_due' &&
		addDays(subscription.updatedAt, PAST_DUE_GRACE_PERIOD_DAYS) <= now

	if (!periodEndedWithCancellation && !pastDueGracePeriodExpired) {
		return subscription
	}

	await db
		.update(subscriptionsTable)
		.set({ status: 'canceled', updatedAt: now })
		.where(eq(subscriptionsTable.id, subscription.id))

	await sendBillingNotificationEmail({
		type: 'subscription_canceled',
		userId: subscription.userId,
	}).catch((error) => {
		console.error(
			'[billing] Falha ao enviar e-mail de cancelamento de assinatura.',
			error,
		)
	})

	return { ...subscription, status: 'canceled', updatedAt: now }
}
