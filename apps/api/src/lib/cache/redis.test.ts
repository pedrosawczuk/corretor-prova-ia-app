import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.unmock('@/lib/cache/redis')

const redisInstanceMock = {
	get: vi.fn(),
	set: vi.fn(),
	del: vi.fn(),
	on: vi.fn(),
}

vi.mock('ioredis', () => ({
	default: vi.fn().mockImplementation(function Redis(this: unknown) {
		return redisInstanceMock
	}),
}))

vi.mock('@app/env', () => ({
	env: { REDIS_URL: 'redis://localhost:6379' },
}))

const { getOrSetCache, invalidateCache } = await import('./redis')

describe('getOrSetCache', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('retorna o valor do cache sem chamar o fetcher quando há hit', async () => {
		redisInstanceMock.get.mockResolvedValue(JSON.stringify({ id: '1' }))
		const fetcher = vi.fn()

		const result = await getOrSetCache('key', 60, fetcher)

		expect(result).toEqual({ id: '1' })
		expect(fetcher).not.toHaveBeenCalled()
	})

	it('busca no fetcher e grava no cache com o TTL informado quando há miss', async () => {
		redisInstanceMock.get.mockResolvedValue(null)
		const fetcher = vi.fn().mockResolvedValue({ id: '2' })

		const result = await getOrSetCache('key', 60, fetcher)

		expect(result).toEqual({ id: '2' })
		expect(redisInstanceMock.set).toHaveBeenCalledWith(
			'key',
			JSON.stringify({ id: '2' }),
			'EX',
			60,
		)
	})

	it('recorre ao fetcher quando a leitura do redis falha', async () => {
		redisInstanceMock.get.mockRejectedValue(new Error('conexão recusada'))
		const fetcher = vi.fn().mockResolvedValue({ id: '3' })

		const result = await getOrSetCache('key', 60, fetcher)

		expect(result).toEqual({ id: '3' })
	})

	it('retorna o valor do fetcher mesmo quando a gravação no cache falha', async () => {
		redisInstanceMock.get.mockResolvedValue(null)
		redisInstanceMock.set.mockRejectedValue(new Error('conexão recusada'))
		const fetcher = vi.fn().mockResolvedValue({ id: '4' })

		await expect(getOrSetCache('key', 60, fetcher)).resolves.toEqual({
			id: '4',
		})
	})
})

describe('invalidateCache', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('remove as chaves informadas', async () => {
		await invalidateCache('a', 'b')

		expect(redisInstanceMock.del).toHaveBeenCalledWith('a', 'b')
	})

	it('não chama o redis quando nenhuma chave é informada', async () => {
		await invalidateCache()

		expect(redisInstanceMock.del).not.toHaveBeenCalled()
	})

	it('não lança erro quando a remoção falha', async () => {
		redisInstanceMock.del.mockRejectedValue(new Error('conexão recusada'))

		await expect(invalidateCache('a')).resolves.toBeUndefined()
	})
})
