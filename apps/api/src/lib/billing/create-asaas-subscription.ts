import dayjs from '@app/dayjs'
import { asaasRequest } from './asaas-client'
import { toAsaasValue } from './to-asaas-value'

interface CreateAsaasSubscriptionParams {
	customerId: string
	valueCents: number
	description: string
	externalReference: string
	successUrl: string
}

interface AsaasSubscription {
	id: string
}

export async function createAsaasSubscription(
	params: CreateAsaasSubscriptionParams,
): Promise<AsaasSubscription> {
	return asaasRequest<AsaasSubscription>('/subscriptions', {
		method: 'POST',
		body: JSON.stringify({
			customer: params.customerId,
			billingType: 'CREDIT_CARD',
			value: toAsaasValue(params.valueCents),
			nextDueDate: dayjs().format('YYYY-MM-DD'),
			cycle: 'MONTHLY',
			description: params.description,
			externalReference: params.externalReference,
			callback: { successUrl: params.successUrl, autoRedirect: true },
		}),
	})
}
