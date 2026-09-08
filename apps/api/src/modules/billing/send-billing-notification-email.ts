import { db, eq, user } from '@app/db'
import {
	sendPaymentFailedEmail,
	sendSubscriptionCancelledEmail,
} from '@/lib/mail/mail'

export interface BillingNotification {
	type: 'payment_failed' | 'subscription_canceled'
	userId: string
}

export async function sendBillingNotificationEmail({
	type,
	userId,
}: BillingNotification): Promise<void> {
	const [account] = await db
		.select({ email: user.email, name: user.name })
		.from(user)
		.where(eq(user.id, userId))

	if (!account) return

	if (type === 'payment_failed') {
		await sendPaymentFailedEmail({ to: account.email, name: account.name })
		return
	}

	await sendSubscriptionCancelledEmail({
		to: account.email,
		name: account.name,
	})
}
