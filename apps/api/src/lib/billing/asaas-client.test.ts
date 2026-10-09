import { afterEach, describe, expect, it, vi } from 'vitest'
import { BillingProviderError } from '@/core/errors'
import { asaasRequest } from './asaas-client'

vi.mock('@app/env', () => ({
	env: {
		ASAAS_API_KEY: 'chave-de-teste',
		ASAAS_API_BASE_URL: 'https://api-sandbox.asaas.com/v3',
	},
}))

function mockFetchResponse(status: number, body: string) {
	const fetchMock = vi.fn().mockResolvedValue(new Response(body, { status }))
	vi.stubGlobal('fetch', fetchMock)
	return fetchMock
}

describe('asaasRequest', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('retorna o corpo da resposta e envia os headers de autenticação', async () => {
		const fetchMock = mockFetchResponse(200, JSON.stringify({ id: 'cus_123' }))

		const result = await asaasRequest<{ id: string }>('/customers', {
			method: 'POST',
		})

		expect(result).toEqual({ id: 'cus_123' })
		expect(fetchMock).toHaveBeenCalledWith(
			'https://api-sandbox.asaas.com/v3/customers',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					access_token: 'chave-de-teste',
					'Content-Type': 'application/json',
					'User-Agent': 'corretor-prova-ia',
				}),
			}),
		)
	})

	it('lança BillingProviderError quando a API responde 400 com errors', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		mockFetchResponse(
			400,
			JSON.stringify({
				errors: [{ code: 'invalid_cpfCnpj', description: 'CPF inválido.' }],
			}),
		)

		await expect(asaasRequest('/customers')).rejects.toBeInstanceOf(
			BillingProviderError,
		)
	})

	it('lança BillingProviderError quando a API responde 500', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		mockFetchResponse(500, JSON.stringify({ errors: [] }))

		await expect(asaasRequest('/customers')).rejects.toBeInstanceOf(
			BillingProviderError,
		)
	})

	it('lança BillingProviderError quando o corpo não é JSON', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		mockFetchResponse(200, '<html>erro</html>')

		await expect(asaasRequest('/customers')).rejects.toBeInstanceOf(
			BillingProviderError,
		)
	})
})
