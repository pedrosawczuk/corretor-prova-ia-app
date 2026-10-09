import { describe, expect, it, vi } from 'vitest'
import { BillingProviderError } from '@/core/errors'
import { asaasRequest } from './asaas-client'
import { getAsaasSubscriptionFirstPaymentUrl } from './get-asaas-subscription-first-payment-url'

vi.mock('./asaas-client', () => ({
	asaasRequest: vi.fn(),
}))

describe('getAsaasSubscriptionFirstPaymentUrl', () => {
	it('retorna a invoiceUrl da primeira cobrança da assinatura', async () => {
		vi.mocked(asaasRequest).mockResolvedValue({
			data: [{ invoiceUrl: 'https://sandbox.asaas.com/i/abc' }],
		})

		await expect(getAsaasSubscriptionFirstPaymentUrl('sub_123')).resolves.toBe(
			'https://sandbox.asaas.com/i/abc',
		)
		expect(asaasRequest).toHaveBeenCalledWith('/subscriptions/sub_123/payments')
	})

	it('lança BillingProviderError quando a assinatura não tem cobranças', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.mocked(asaasRequest).mockResolvedValue({ data: [] })

		await expect(
			getAsaasSubscriptionFirstPaymentUrl('sub_123'),
		).rejects.toBeInstanceOf(BillingProviderError)
	})
})
