import { TooManyRequestsError } from '@/core/errors'
import { redis } from '@/lib/cache/redis'
import { incrementInMemoryBucket } from '@/lib/cache/resilient-rate-limit-store'

type AiGenerationKind = 'generate-exam' | 'regenerate-question'

interface QuotaRule {
	windowSeconds: number
	max: number
	label: string
}

const AI_QUOTA_RULES: Record<AiGenerationKind, QuotaRule[]> = {
	'generate-exam': [
		{ windowSeconds: 60, max: 10, label: 'minuto' },
		{ windowSeconds: 60 * 60 * 24, max: 40, label: 'dia' },
	],
	'regenerate-question': [
		{ windowSeconds: 60, max: 15, label: 'minuto' },
		{ windowSeconds: 60 * 60 * 24, max: 80, label: 'dia' },
	],
}

async function incrementCounter(
	key: string,
	windowSeconds: number,
	cost: number,
): Promise<number> {
	try {
		const count = await redis.incrby(key, cost)
		if (count === cost) {
			await redis.expire(key, windowSeconds)
		}
		return count
	} catch {
		return incrementInMemoryBucket(key, windowSeconds * 1000, cost).current
	}
}

export async function assertAiGenerationRateLimit(
	userId: string,
	kind: AiGenerationKind,
	cost = 1,
): Promise<void> {
	const rules = AI_QUOTA_RULES[kind]

	for (const rule of rules) {
		const key = `ai-quota:${kind}:${rule.windowSeconds}:${userId}`
		const current = await incrementCounter(key, rule.windowSeconds, cost)

		if (current > rule.max) {
			throw new TooManyRequestsError(
				`Limite de geração por IA por ${rule.label} atingido. Tente novamente mais tarde.`,
			)
		}
	}
}
