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
	DATABASE_URL: z.url().startsWith('postgresql://'),
})

export type DbEnv = z.infer<typeof dbEnvSchema>

export const apiEnvSchema = dbEnvSchema.extend({
	NODE_ENV: z.enum(['dev', 'prod', 'test']),
	PORT: z.coerce.number(),
	HOST: z.string(),
	TRUST_PROXY: z.stringbool().default(false),
	REDIS_URL: z.url(),
	REDIS_HOST: z.string(),
	REDIS_PORT: z.coerce.number(),
	BETTER_AUTH_SECRET: z.string().min(1),
	BETTER_AUTH_URL: z.url(),
	WEB_URL: z.url().default('http://localhost:3000'),
	GOOGLE_CLIENT_ID: z.string().min(1).optional(),
	GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
	RESEND_API_KEY: z.string().min(1).optional(),
	MAIL_FROM: z.string().optional(),
	GEMINI_API_KEY: z.string().min(1).optional().catch(undefined),
	GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
	MINIO_ENDPOINT: z.string().min(1),
	MINIO_PORT: z.coerce.number(),
	MINIO_USE_SSL: z.stringbool(),
	MINIO_ACCESS_KEY: z.string().min(1),
	MINIO_SECRET_KEY: z.string().min(1),
	MINIO_BUCKET: z.string().min(1),
})

export type ApiEnv = z.infer<typeof apiEnvSchema>

export const dbEnv = dbEnvSchema.parse(process.env)
export const apiEnv = apiEnvSchema.parse(process.env)

export const env = apiEnv
export type Env = ApiEnv
