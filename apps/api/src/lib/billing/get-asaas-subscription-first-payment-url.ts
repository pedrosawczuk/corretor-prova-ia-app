import { BillingProviderError } from '@/core/errors'
import { asaasRequest } from './asaas-client'

interface AsaasSubscriptionPayments {
	data: { invoiceUrl: string }[]
}

export async function getAsaasSubscriptionFirstPaymentUrl(
	subscriptionId: string,
): Promise<string> {
	const { data } = await asaasRequest<AsaasSubscriptionPayments>(
		`/subscriptions/${subscriptionId}/payments`,
	)
	const [firstPayment] = data

	if (!firstPayment) {
		console.error('[asaas] Assinatura sem cobranças geradas:', {
			subscriptionId,
		})
		throw new BillingProviderError()
	}

	return firstPayment.invoiceUrl
}
