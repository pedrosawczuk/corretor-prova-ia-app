import { ApiError } from '@google/genai'
import { describe, expect, it, vi } from 'vitest'
import { withGeminiRetry } from './with-gemini-retry'

describe('withGeminiRetry', () => {
	it('tenta de novo quando a API do Gemini está sobrecarregada', async () => {
		const operation = vi
			.fn<() => Promise<string>>()
			.mockRejectedValueOnce(
				new ApiError({ message: 'overloaded', status: 503 }),
			)
			.mockResolvedValueOnce('ok')

		await expect(withGeminiRetry(operation, 1)).resolves.toBe('ok')
		expect(operation).toHaveBeenCalledTimes(2)
	})

	it('desiste depois do número máximo de tentativas', async () => {
		const operation = vi
			.fn<() => Promise<string>>()
			.mockRejectedValue(new ApiError({ message: 'rate limit', status: 429 }))

		await expect(withGeminiRetry(operation, 1)).rejects.toThrow('rate limit')
		expect(operation).toHaveBeenCalledTimes(4)
	})

	it('espera o tempo sugerido pelo Gemini antes de tentar de novo após estourar a cota', async () => {
		vi.useFakeTimers()

		const quotaError = new ApiError({
			message: '{"error":{"details":[{"retryDelay":"20s"}]}}',
			status: 429,
		})
		const operation = vi
			.fn<() => Promise<string>>()
			.mockRejectedValueOnce(quotaError)
			.mockResolvedValueOnce('ok')

		const result = withGeminiRetry(operation, 1)

		await vi.advanceTimersByTimeAsync(19_000)
		expect(operation).toHaveBeenCalledTimes(1)

		await vi.advanceTimersByTimeAsync(1_000)
		await expect(result).resolves.toBe('ok')
		expect(operation).toHaveBeenCalledTimes(2)

		vi.useRealTimers()
	})

	it('desiste na hora quando o Gemini pede uma espera longa demais, como na cota diária', async () => {
		const operation = vi.fn<() => Promise<string>>().mockRejectedValue(
			new ApiError({
				message: '{"error":{"details":[{"retryDelay":"23824s"}]}}',
				status: 429,
			}),
		)

		await expect(withGeminiRetry(operation, 1)).rejects.toThrow('23824s')
		expect(operation).toHaveBeenCalledTimes(1)
	})

	it('não repete erros que não são temporários', async () => {
		const operation = vi
			.fn<() => Promise<string>>()
			.mockRejectedValue(new ApiError({ message: 'bad request', status: 400 }))

		await expect(withGeminiRetry(operation, 1)).rejects.toThrow('bad request')
		expect(operation).toHaveBeenCalledTimes(1)
	})
})
