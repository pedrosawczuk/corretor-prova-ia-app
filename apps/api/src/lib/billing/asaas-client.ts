import { env } from '@app/env'
import { BillingProviderError } from '@/core/errors'

interface AsaasErrorItem {
	code: string
	description: string
}

interface AsaasErrorBody {
	errors?: AsaasErrorItem[]
}

export async function asaasRequest<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${env.ASAAS_API_BASE_URL}${path}`, {
		...init,
		headers: {
			access_token: env.ASAAS_API_KEY,
			'Content-Type': 'application/json',
			'User-Agent': 'corretor-prova-ia',
			...init?.headers,
		},
	})

	const body = (await response.json().catch(() => null)) as
		| (T & AsaasErrorBody)
		| null

	if (!response.ok || !body) {
		console.error('[asaas] Falha na chamada à API:', {
			path,
			status: response.status,
			errors: body?.errors,
		})
		throw new BillingProviderError()
	}

	return body
}
