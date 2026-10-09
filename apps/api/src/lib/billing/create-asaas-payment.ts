import dayjs from '@app/dayjs'
import { asaasRequest } from './asaas-client'
import { toAsaasValue } from './to-asaas-value'

interface CreateAsaasPaymentParams {
	customerId: string
	valueCents: number
	description: string
	externalReference: string
	successUrl: string
}

interface AsaasPayment {
	id: string
	invoiceUrl: string
}

export async function createAsaasPayment(
	params: CreateAsaasPaymentParams,
): Promise<AsaasPayment> {
	return asaasRequest<AsaasPayment>('/payments', {
		method: 'POST',
		body: JSON.stringify({
			customer: params.customerId,
			billingType: 'PIX',
			value: toAsaasValue(params.valueCents),
			dueDate: dayjs().format('YYYY-MM-DD'),
			description: params.description,
			externalReference: params.externalReference,
			callback: { successUrl: params.successUrl, autoRedirect: true },
		}),
	})
}
