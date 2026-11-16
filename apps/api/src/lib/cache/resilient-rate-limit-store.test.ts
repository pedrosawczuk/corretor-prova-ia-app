import { describe, expect, it, vi } from 'vitest'
import { ResilientRateLimitStore } from './resilient-rate-limit-store'

vi.mock('./redis', () => ({
	redis: {
		multi: () => {
			throw new Error('Redis unavailable')
		},
	},
}))

describe('ResilientRateLimitStore', () => {
	it('faz fallback em memória quando o Redis falha em vez de liberar sem limite', async () => {
		const store = new ResilientRateLimitStore({ nameSpace: 'test-rl:' })

		const first = await new Promise<{ current: number; ttl: number }>(
			(resolve, reject) => {
				store.incr(
					'user-ip-1',
					(err, res) => {
						if (err || !res) reject(err ?? new Error('Missing result'))
						else resolve(res)
					},
					60_000,
					5,
				)
			},
		)

		const second = await new Promise<{ current: number; ttl: number }>(
			(resolve, reject) => {
				store.incr(
					'user-ip-1',
					(err, res) => {
						if (err || !res) reject(err ?? new Error('Missing result'))
						else resolve(res)
					},
					60_000,
					5,
				)
			},
		)

		expect(first.current).toBe(1)
		expect(second.current).toBe(2)
		expect(second.ttl).toBeGreaterThan(0)
	})
})
