import { env } from '@app/env'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { toNodeHandler } from 'better-auth/node'
import fastify from 'fastify'
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { registerAuditLogHook } from '@/lib/audit/register-audit-log-hook'
import { auth } from '@/lib/auth/auth'
import {
	guardAdminAuthRoute,
	isAdminAuthRoute,
	recordAdminAuthAuditLog,
} from '@/lib/auth/guard-admin-auth-routes'
import { redis } from '@/lib/cache/redis'
import { registerErrorHandler } from '@/lib/http/register-error-handler'
import { isSensitiveAuthPath } from '@/lib/http/sensitive-auth-paths'
import {
	ensureAvatarsBucket,
	MAX_AVATAR_SIZE_BYTES,
} from '@/lib/storage/storage'
import { adminRoutes } from '@/modules/admin/admin-routes'
import { authRoutes } from '@/modules/auth/auth-routes'
import { classroomRoutes } from '@/modules/classrooms/classroom-routes'
import { examRoutes } from '@/modules/exams/exam-routes'

export const app = fastify({
	trustProxy: env.TRUST_PROXY,
}).withTypeProvider<ZodTypeProvider>()

await app.register(cors, {
	origin: [env.BETTER_AUTH_URL, 'http://localhost:3000'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

await app.register(multipart, {
	limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
})

await app.register(rateLimit, {
	max: 100,
	timeWindow: '1 minute',
	redis,
	nameSpace: 'rate-limit:',
	ban: 5,
	skipOnError: true,
	errorResponseBuilder: (_request, context) => ({
		code: context.ban ? 'RATE_LIMIT_BANNED' : 'RATE_LIMIT_EXCEEDED',
		message: `Muitas requisições. Tente novamente em ${context.after}.`,
	}),
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

registerErrorHandler(app)
registerAuditLogHook(app)

await ensureAvatarsBucket()

app.all(
	'/api/auth/*',
	{
		config: {
			rateLimit: {
				max: (request) => (isSensitiveAuthPath(request.url) ? 10 : 60),
				timeWindow: '1 minute',
				ban: 3,
			},
		},
	},
	async (request, reply) => {
		if (isAdminAuthRoute(request.url)) {
			const allowed = await guardAdminAuthRoute(request, reply)
			if (!allowed) return

			await toNodeHandler(auth)(request.raw, reply.raw)
			await recordAdminAuthAuditLog(request, reply)
			return
		}

		return toNodeHandler(auth)(request.raw, reply.raw)
	},
)

app.register(authRoutes, { prefix: '/auth' })
app.register(classroomRoutes, { prefix: '/classrooms' })
app.register(examRoutes, { prefix: '/exams' })
app.register(adminRoutes, { prefix: '/admin' })

app.get('/', async () => {
	return { message: 'Hello World' }
})
