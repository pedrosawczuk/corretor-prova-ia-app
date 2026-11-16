import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'
import { resolveDatabaseUrl } from './resolve-database-url'

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
	NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
	DATABASE_URL: z.url().startsWith('postgresql://'),
	TEST_DATABASE_URL: z.url().startsWith('postgresql://').optional(),
})

export type DbEnv = z.infer<typeof dbEnvSchema>

const trustProxySchema = z
	.union([z.boolean(), z.number().int().min(0), z.string()])
	.optional()
	.transform(
		(val): boolean | ((address: string, hop: number) => boolean) | string[] => {
			if (val === undefined || val === '' || val === false || val === 'false') {
				return false
			}
			if (val === true || val === 'true') {
				return (_address: string, hop: number) => hop <= 1
			}
			if (typeof val === 'number') {
				return (_address: string, hop: number) => hop <= val
			}
			const trimmed = val.trim()
			if (/^\d+$/.test(trimmed)) {
				const maxHops = Number(trimmed)
				return (_address: string, hop: number) => hop <= maxHops
			}
			const cidrs = trimmed
				.split(',')
				.map((entry) => entry.trim())
				.filter(Boolean)
			return cidrs.length > 0 ? cidrs : false
		},
	)

export const apiEnvSchema = dbEnvSchema.extend({
	PORT: z.coerce.number(),
	HOST: z.string(),
	TRUST_PROXY: trustProxySchema,
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
	GEMINI_READING_FALLBACK_MODEL: z
		.string()
		.min(1)
		.default('gemini-3-flash-preview'),
	MINIO_ENDPOINT: z.string().min(1),
	MINIO_PORT: z.coerce.number(),
	MINIO_USE_SSL: z.stringbool(),
	MINIO_ACCESS_KEY: z.string().min(1),
	MINIO_SECRET_KEY: z.string().min(1),
	MINIO_BUCKET: z.string().min(1),
	ASAAS_API_KEY: z.string().min(1),
	ASAAS_WEBHOOK_TOKEN: z.string().min(32),
	ASAAS_API_BASE_URL: z.url(),
})

export type ApiEnv = z.infer<typeof apiEnvSchema>

function withResolvedDatabaseUrl<T extends DbEnv>(parsed: T): T {
	return { ...parsed, DATABASE_URL: resolveDatabaseUrl(parsed) }
}

export const dbEnv = withResolvedDatabaseUrl(dbEnvSchema.parse(process.env))
export const apiEnv = withResolvedDatabaseUrl(apiEnvSchema.parse(process.env))

export const env = apiEnv
export type Env = ApiEnv

export { getDatabaseName, resolveDatabaseUrl } from './resolve-database-url'
