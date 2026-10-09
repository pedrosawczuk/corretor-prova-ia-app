import { db, eq, subscriptionsTable } from '@app/db'
import {
	type AsaasExternalReference,
	parseAsaasExternalReference,
} from '@/lib/billing/asaas-external-reference'
import { getAsaasSubscription } from '@/lib/billing/get-asaas-subscription'

interface ResolveSubscriptionPaymentOwnerParams {
	asaasSubscriptionId: string
	paymentExternalReference: string | undefined
}

export async function resolveSubscriptionPaymentOwner({
	asaasSubscriptionId,
	paymentExternalReference,
}: ResolveSubscriptionPaymentOwnerParams): Promise<AsaasExternalReference | null> {
	const [existingSubscription] = await db
		.select({ id: subscriptionsTable.id })
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.asaasSubscriptionId, asaasSubscriptionId))

	if (existingSubscription) {
		return null
	}

	const ownerFromPayment = parseAsaasExternalReference(paymentExternalReference)

	if (ownerFromPayment) {
		return ownerFromPayment
	}

	const asaasSubscription = await getAsaasSubscription(asaasSubscriptionId)

	return parseAsaasExternalReference(
		asaasSubscription.externalReference ?? undefined,
	)
}
