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

	request.currentUser = { id: session.user.id, email: session.user.email }
	request.currentSessionId = session.session.id

	return session.user
}
