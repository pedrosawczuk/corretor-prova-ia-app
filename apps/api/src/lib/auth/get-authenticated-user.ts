import type { FastifyRequest } from 'fastify'
import { UnauthorizedError } from '@/core/errors'
import { auth } from './auth'
import { toFetchHeaders } from './http-utils'

export async function getAuthenticatedUser(request: FastifyRequest) {
	const session = await auth.api.getSession({
		headers: toFetchHeaders(request.headers),
	})

	if (!session) {
		throw new UnauthorizedError(
			'Você precisa estar autenticado para continuar.',
		)
	}

	return session.user
}
