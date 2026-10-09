import { asaasRequest } from './asaas-client'

interface AsaasSubscriptionDetails {
	id: string
	externalReference: string | null
	status: string
}

export async function getAsaasSubscription(
	subscriptionId: string,
): Promise<AsaasSubscriptionDetails> {
	return asaasRequest<AsaasSubscriptionDetails>(
		`/subscriptions/${subscriptionId}`,
	)
}
