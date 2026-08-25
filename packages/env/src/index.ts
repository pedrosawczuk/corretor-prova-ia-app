import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

for (const envPath of ['.env', '../../.env', '../.env']) {
	const fullPath = resolve(process.cwd(), envPath)
	if (existsSync(fullPath)) {
		try {
			process.loadEnvFile(fullPath)
			break
		} catch {}
	}
}

export const dbEnvSchema = z.object({
	DATABASE_URL: z.string().url().startsWith('postgresql://'),
})

export type DbEnv = z.infer<typeof dbEnvSchema>

export const apiEnvSchema = dbEnvSchema.extend({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	PORT: z.coerce.number().default(3333),
	HOST: z.string().default('0.0.0.0'),
	REDIS_URL: z.string().url().default('redis://localhost:6379'),
	REDIS_HOST: z.string().default('localhost'),
	REDIS_PORT: z.coerce.number().default(6379),
})

export type ApiEnv = z.infer<typeof apiEnvSchema>

export const dbEnv = dbEnvSchema.parse(process.env)
export const apiEnv = apiEnvSchema.parse(process.env)

export const env = apiEnv
export type Env = ApiEnv
