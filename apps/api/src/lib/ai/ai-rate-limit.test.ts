import { describe, expect, it, vi } from 'vitest'
import { TooManyRequestsError } from '@/core/errors'
import { assertAiGenerationRateLimit } from './ai-rate-limit'

vi.mock('@/lib/cache/redis', () => ({
	redis: {
		incrby: vi.fn().mockRejectedValue(new Error('Redis offline')),
	},
}))

describe('assertAiGenerationRateLimit', () => {
	it('bloqueia após exceder o limite por minuto para o mesmo usuário', async () => {
		const userId = `ai-limit-user-${Date.now()}`

		for (let i = 0; i < 5; i++) {
			await expect(
				assertAiGenerationRateLimit(userId, 'generate-exam', 2),
			).resolves.toBeUndefined()
		}

		await expect(
			assertAiGenerationRateLimit(userId, 'generate-exam', 2),
		).rejects.toBeInstanceOf(TooManyRequestsError)
	})
})
