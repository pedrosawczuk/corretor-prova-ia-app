import { ApiError } from '@google/genai'
import { describe, expect, it, vi } from 'vitest'
import { withModelFallback } from './with-model-fallback'

describe('withModelFallback', () => {
	it('usa o modelo reserva quando o principal estourou a cota', async () => {
		const operation = vi.fn(async (model: string) => {
			if (model === 'principal') {
				throw new ApiError({ message: 'quota', status: 429 })
			}
			return `lido por ${model}`
		})

		await expect(
			withModelFallback(['principal', 'reserva'], operation),
		).resolves.toBe('lido por reserva')
		expect(operation).toHaveBeenCalledTimes(2)
	})

	it('não chama o reserva quando o principal responde', async () => {
		const operation = vi.fn(async (model: string) => model)

		await expect(
			withModelFallback(['principal', 'reserva'], operation),
		).resolves.toBe('principal')
		expect(operation).toHaveBeenCalledTimes(1)
	})

	it('não troca de modelo em erro que não é de disponibilidade', async () => {
		const operation = vi.fn(async () => {
			throw new ApiError({ message: 'bad request', status: 400 })
		})

		await expect(
			withModelFallback(['principal', 'reserva'], operation),
		).rejects.toThrow('bad request')
		expect(operation).toHaveBeenCalledTimes(1)
	})

	it('não repete o mesmo modelo quando principal e reserva são iguais', async () => {
		const operation = vi.fn(async () => {
			throw new ApiError({ message: 'quota', status: 429 })
		})

		await expect(
			withModelFallback(['mesmo', 'mesmo'], operation),
		).rejects.toThrow('quota')
		expect(operation).toHaveBeenCalledTimes(1)
	})
})
