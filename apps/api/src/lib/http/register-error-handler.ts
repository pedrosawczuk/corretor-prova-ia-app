import { APIError } from 'better-auth/api'
import type { FastifyError, FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { ZodError } from 'zod'
import { AppError } from '@/core/errors'

export function registerErrorHandler(app: FastifyInstance) {
	app.setErrorHandler((error: FastifyError, _request, reply) => {
		if (error instanceof AppError) {
			return reply.status(error.statusCode).send({
				code: error.errorCode,
				message: error.message,
			})
		}

		if (hasZodFastifySchemaValidationErrors(error)) {
			return reply.status(400).send({
				code: 'VALIDATION_ERROR',
				message: 'Falha na validação dos campos enviados.',
				issues: error.validation,
			})
		}

		if (error instanceof ZodError) {
			return reply.status(400).send({
				code: 'VALIDATION_ERROR',
				message: 'Falha na validação dos campos enviados.',
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

		if (error.statusCode && error.statusCode < 500) {
			return reply.status(error.statusCode).send({
				code: error.code || 'BAD_REQUEST',
				message: error.message,
			})
		}

		return reply.status(500).send({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Erro interno do servidor.',
		})
	})
}
