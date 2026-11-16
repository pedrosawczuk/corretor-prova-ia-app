import { redis } from './redis'

interface MemoryBucket {
	current: number
	expiresAt: number
}

const MAX_MEMORY_BUCKETS = 10_000
const memoryFallback = new Map<string, MemoryBucket>()

export function incrementInMemoryBucket(
	key: string,
	timeWindowMs: number,
	cost = 1,
): { current: number; ttl: number } {
	const now = Date.now()
	const existing = memoryFallback.get(key)

	if (existing && existing.expiresAt > now) {
		existing.current += cost
		return {
			current: existing.current,
			ttl: Math.max(1, existing.expiresAt - now),
		}
	}

	if (memoryFallback.size >= MAX_MEMORY_BUCKETS) {
		for (const [entryKey, bucket] of memoryFallback.entries()) {
			if (bucket.expiresAt <= now) {
				memoryFallback.delete(entryKey)
			}
		}
		if (memoryFallback.size >= MAX_MEMORY_BUCKETS) {
			const oldestKey = memoryFallback.keys().next().value
			if (oldestKey !== undefined) {
				memoryFallback.delete(oldestKey)
			}
		}
	}

	const expiresAt = now + timeWindowMs
	memoryFallback.set(key, { current: cost, expiresAt })
	return { current: cost, ttl: timeWindowMs }
}

interface StoreOptions {
	nameSpace?: string
}

type IncrCallback = (
	error: Error | null,
	result?: { current: number; ttl: number },
) => void

export class ResilientRateLimitStore {
	private readonly nameSpace: string

	constructor(options?: StoreOptions) {
		this.nameSpace =
			typeof options?.nameSpace === 'string' ? options.nameSpace : 'rate-limit:'
	}

	incr(
		key: string,
		callback: IncrCallback,
		timeWindow: number,
		_max: number,
	): void {
		const namespacedKey = `${this.nameSpace}${key}`

		void (async () => {
			try {
				const results = await redis
					.multi()
					.incr(namespacedKey)
					.pttl(namespacedKey)
					.exec()

				const current = Number(results?.[0]?.[1] ?? 1)
				let ttl = Number(results?.[1]?.[1] ?? -1)

				if (ttl < 0) {
					await redis.pexpire(namespacedKey, timeWindow)
					ttl = timeWindow
				}

				callback(null, { current, ttl })
			} catch {
				// Fail-secure: se o Redis estiver indisponível, aplica o limite em
				// memória por instância em vez de liberar requisições sem controle.
				callback(null, incrementInMemoryBucket(namespacedKey, timeWindow))
			}
		})()
	}

	child(routeOptions: object): ResilientRateLimitStore {
		const candidate = routeOptions as StoreOptions
		return new ResilientRateLimitStore({
			nameSpace:
				typeof candidate.nameSpace === 'string'
					? candidate.nameSpace
					: this.nameSpace,
		})
	}
}
