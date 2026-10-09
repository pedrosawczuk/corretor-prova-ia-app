import { and, billingEventsTable, eq, inArray, isNotNull, ne } from '@app/db'
import type { BillingTransaction } from './billing-transaction'
import { PAID_PAYMENT_EVENTS } from './paid-payment-events'

interface IsPaymentAlreadyProcessedParams {
	paymentId: string
	billingEventId: string
}

export async function isPaymentAlreadyProcessed(
	tx: BillingTransaction,
	{ paymentId, billingEventId }: IsPaymentAlreadyProcessedParams,
): Promise<boolean> {
	const [processedEvent] = await tx
		.select({ id: billingEventsTable.id })
		.from(billingEventsTable)
		.where(
			and(
				eq(billingEventsTable.asaasPaymentId, paymentId),
				inArray(billingEventsTable.eventType, PAID_PAYMENT_EVENTS),
				isNotNull(billingEventsTable.processedAt),
				ne(billingEventsTable.id, billingEventId),
			),
		)
		.limit(1)

	return Boolean(processedEvent)
}
