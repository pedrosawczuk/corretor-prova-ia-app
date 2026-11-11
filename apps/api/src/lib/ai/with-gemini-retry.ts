import { ApiError } from '@google/genai'

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504])
const MAX_ATTEMPTS = 4
const BASE_DELAY_MS = 1500
const MAX_SERVER_SUGGESTED_DELAY_MS = 40_000
const RETRY_DELAY_PATTERN = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/

function isRetryableError(error: Error): error is ApiError {
	return error instanceof ApiError && RETRYABLE_STATUSES.has(error.status)
}

function readServerSuggestedDelayMs(error: ApiError): number | null {
	const match = RETRY_DELAY_PATTERN.exec(error.message)
	if (!match) return null

	return Number(match[1]) * 1000
}

function wait(milliseconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function withGeminiRetry<T>(
	operation: () => Promise<T>,
	baseDelayMs = BASE_DELAY_MS,
): Promise<T> {
	for (let attempt = 1; ; attempt++) {
		try {
			return await operation()
		} catch (error) {
			if (
				!(error instanceof Error) ||
				!isRetryableError(error) ||
				attempt >= MAX_ATTEMPTS
			) {
				throw error
			}

			const backoffMs = baseDelayMs * 2 ** (attempt - 1)
			const suggestedMs = readServerSuggestedDelayMs(error) ?? 0

			if (suggestedMs > MAX_SERVER_SUGGESTED_DELAY_MS) throw error

			await wait(Math.max(backoffMs, suggestedMs))
		}
	}
}
