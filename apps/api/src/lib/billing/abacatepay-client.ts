import { env } from '@app/env'
import { BillingProviderError } from '@/core/errors'

interface AbacatePayEnvelope<T> {
	data: T | null
	error: string | null
}

export async function abacatepayRequest<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${env.ABACATEPAY_API_BASE_URL}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${env.ABACATEPAY_API_KEY}`,
			'Content-Type': 'application/json',
			...init?.headers,
		},
	})

	const body = (await response
		.json()
		.catch(() => null)) as AbacatePayEnvelope<T> | null

	if (!response.ok || !body || body.error) {
		console.error('[abacatepay] Falha na chamada à API:', {
			path,
			status: response.status,
			error: body?.error,
		})
		throw new BillingProviderError()
	}

	return body.data as T
}
