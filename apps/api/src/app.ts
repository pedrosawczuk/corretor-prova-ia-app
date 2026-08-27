import { env } from '@app/env'
import cors from '@fastify/cors'
import { APIError } from 'better-auth/api'
import { toNodeHandler } from 'better-auth/node'
import fastify from 'fastify'
import {
	hasZodFastifySchemaValidationErrors,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'
import { AppError } from '@/core/errors'
import { auth } from '@/lib/auth'
import { authRoutes } from '@/modules/auth/auth-routes'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

await app.register(cors, {
	origin: [env.BETTER_AUTH_URL, 'http://localhost:3000'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler((error, _request, reply) => {
	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			code: error.errorCode,
			message: error.message,
		})
	}

	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.status(400).send({
			code: 'VALIDATION_ERROR',
			message: 'Validation failed for the provided fields.',
			issues: error.validation,
		})
	}

	if (error instanceof ZodError) {
		return reply.status(400).send({
			code: 'VALIDATION_ERROR',
			message: 'Validation failed for the provided fields.',
			issues: error.format(),
		})
	}

	if (error instanceof APIError) {
		const statusCode =
			typeof error.status === 'number'
				? error.status
				: Number(error.status) || 400

		return reply.status(statusCode).send({
			code: error.body?.code || 'AUTH_ERROR',
			message: error.message,
		})
	}

	console.error(error)

	return reply.status(500).send({
		code: 'INTERNAL_SERVER_ERROR',
		message: 'Internal server error.',
	})
})

app.all('/api/auth/*', async (request, reply) => {
	return toNodeHandler(auth)(request.raw, reply.raw)
})

app.register(authRoutes, { prefix: '/auth' })

app.get('/', async () => {
	return { message: 'Hello World' }
})
