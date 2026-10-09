import { asaasRequest } from './asaas-client'

export async function cancelAsaasSubscription(
	subscriptionId: string,
): Promise<void> {
	await asaasRequest(`/subscriptions/${subscriptionId}`, {
		method: 'DELETE',
	})
}
