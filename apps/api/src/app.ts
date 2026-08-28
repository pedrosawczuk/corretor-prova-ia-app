import { env } from '@app/env'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { toNodeHandler } from 'better-auth/node'
import fastify from 'fastify'
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { auth } from '@/lib/auth'
import { registerErrorHandler } from '@/lib/register-error-handler'
import { ensureAvatarsBucket, MAX_AVATAR_SIZE_BYTES } from '@/lib/storage'
import { authRoutes } from '@/modules/auth/auth-routes'
import { classroomRoutes } from '@/modules/classrooms/classroom-routes'
import { examRoutes } from '@/modules/exams/exam-routes'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

await app.register(cors, {
	origin: [env.BETTER_AUTH_URL, 'http://localhost:3000'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

await app.register(multipart, {
	limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

registerErrorHandler(app)

await ensureAvatarsBucket()

app.all('/api/auth/*', async (request, reply) => {
	return toNodeHandler(auth)(request.raw, reply.raw)
})

app.register(authRoutes, { prefix: '/auth' })
app.register(classroomRoutes, { prefix: '/classrooms' })
app.register(examRoutes, { prefix: '/exams' })

app.get('/', async () => {
	return { message: 'Hello World' }
})
