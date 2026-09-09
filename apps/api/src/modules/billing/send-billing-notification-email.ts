import { db, eq, user } from '@app/db'
import {
	sendPaymentFailedEmail,
	sendPaymentReceivedEmail,
	sendSubscriptionCancelledEmail,
} from '@/lib/mail/mail'

export type BillingNotification =
	| { type: 'payment_failed'; userId: string }
	| { type: 'subscription_canceled'; userId: string }
	| {
			type: 'payment_received'
			userId: string
			planName: string
			priceCents: number
	  }

export async function sendBillingNotificationEmail(
	notification: BillingNotification,
): Promise<void> {
	const [account] = await db
		.select({ email: user.email, name: user.name })
		.from(user)
		.where(eq(user.id, notification.userId))

	if (!account) return

	switch (notification.type) {
		case 'payment_failed':
			await sendPaymentFailedEmail({ to: account.email, name: account.name })
			return
		case 'payment_received':
			await sendPaymentReceivedEmail({
				to: account.email,
				name: account.name,
				planName: notification.planName,
				priceCents: notification.priceCents,
			})
			return
		case 'subscription_canceled':
			await sendSubscriptionCancelledEmail({
				to: account.email,
				name: account.name,
			})
	}
}
