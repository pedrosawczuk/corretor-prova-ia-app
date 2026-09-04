import { abacatepayRequest } from './abacatepay-client'

interface CreateAbacatePayBillingParams {
	billingType: 'one_time' | 'recurring'
	productId: string
	customerId: string
	returnUrl: string
	completionUrl: string
	metadata: Record<string, string>
}

interface AbacatePayBilling {
	id: string
	url: string
	status: string
}

export async function createAbacatePayBilling(
	params: CreateAbacatePayBillingParams,
): Promise<AbacatePayBilling> {
	const path =
		params.billingType === 'one_time'
			? '/checkouts/create'
			: '/subscriptions/create'

	const body: Record<string, unknown> = {
		items: [{ id: params.productId, quantity: 1 }],
		customerId: params.customerId,
		methods: ['PIX', 'CARD'],
		returnUrl: params.returnUrl,
		completionUrl: params.completionUrl,
		metadata: params.metadata,
	}

	if (params.billingType === 'recurring') {
		body.card = { maxInstallments: 1 }
		body.retryPolicy = { maxRetry: 3, retryEvery: 1 }
	}

	return abacatepayRequest<AbacatePayBilling>(path, {
		method: 'POST',
		body: JSON.stringify(body),
	})
}
