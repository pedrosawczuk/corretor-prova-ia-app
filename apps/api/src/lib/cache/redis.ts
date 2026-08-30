import { env } from '@app/env'
import Redis from 'ioredis'

export const redis = new Redis(env.REDIS_URL, {
	maxRetriesPerRequest: 2,
	lazyConnect: true,
})

redis.on('error', (error) => {
	console.error('[redis] connection error:', error.message)
})

export async function getOrSetCache<T>(
	key: string,
	ttlSeconds: number,
	fetcher: () => Promise<T>,
): Promise<T> {
	try {
		const cached = await redis.get(key)
		if (cached !== null) {
			return JSON.parse(cached) as T
		}
	} catch (error) {
		console.error(`[redis] falha ao ler cache "${key}":`, error)
	}

	const value = await fetcher()

	try {
		await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
	} catch (error) {
		console.error(`[redis] falha ao gravar cache "${key}":`, error)
	}

	return value
}

export async function invalidateCache(...keys: string[]) {
	if (keys.length === 0) return

	try {
		await redis.del(...keys)
	} catch (error) {
		console.error('[redis] falha ao invalidar cache:', error)
	}
}
