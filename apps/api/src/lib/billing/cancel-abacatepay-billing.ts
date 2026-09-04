import { abacatepayRequest } from './abacatepay-client'

export async function cancelAbacatePaySubscription(
	subscriptionId: string,
): Promise<void> {
	await abacatepayRequest('/subscriptions/cancel', {
		method: 'POST',
		body: JSON.stringify({ id: subscriptionId }),
	})
}
