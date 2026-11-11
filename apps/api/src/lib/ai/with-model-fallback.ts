import { ApiError } from '@google/genai'

const FALLBACK_STATUSES = new Set([404, 429, 500, 502, 503, 504])

function shouldTryNextModel(error: Error): boolean {
	return error instanceof ApiError && FALLBACK_STATUSES.has(error.status)
}

export async function withModelFallback<T>(
	models: string[],
	operation: (model: string) => Promise<T>,
): Promise<T> {
	const uniqueModels = [...new Set(models)]
	let lastError: Error | undefined

	for (const model of uniqueModels) {
		try {
			return await operation(model)
		} catch (error) {
			if (!(error instanceof Error) || !shouldTryNextModel(error)) throw error
			lastError = error
		}
	}

	throw lastError ?? new Error('Nenhum modelo de IA configurado.')
}
