import { billingEventsTable, db } from '@app/db'
import { faker } from '@faker-js/faker'

type BillingEvent = typeof billingEventsTable.$inferSelect

export async function insertBillingEvent(overrides: Partial<BillingEvent> = {}) {
	const asaasEventId = overrides.asaasEventId ?? `evt_${faker.string.alphanumeric(12)}`
	const asaasPaymentId =
		overrides.asaasPaymentId ?? `pay_${faker.string.alphanumeric(12)}`
	const eventType = overrides.eventType ?? 'PAYMENT_CONFIRMED'

	const [row] = await db
		.insert(billingEventsTable)
		.values({
			payload: { id: asaasEventId, event: eventType, payment: { id: asaasPaymentId } },
			processedAt: new Date(),
			...overrides,
			asaasEventId,
			asaasPaymentId,
			eventType,
		})
		.returning()

	return row
}
