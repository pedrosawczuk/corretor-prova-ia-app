import { AppError } from '@/core/errors'
import { auth } from '@/lib/auth'
import { authRoutes } from '@/modules/auth/auth-routes'
import { APIError } from 'better-auth/api'
import { toNodeHandler } from 'better-auth/node'
import fastify from 'fastify'
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler((error, request, reply) => {
	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			code: error.errorCode,
			message: error.message,
		})
	}

	if (error instanceof ZodError) {
		return reply.status(400).send({
			code: 'VALIDATION_ERROR',
			message: 'Erro de validação nos campos informados.',
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
		message: 'Ocorreu um erro interno no servidor.',
	})
})

app.all('/api/auth/*', async (request, reply) => {
	return toNodeHandler(auth)(request.raw, reply.raw)
})

app.register(authRoutes, { prefix: '/auth' })

app.get('/', async () => {
	return { message: 'Hello World' }
})
