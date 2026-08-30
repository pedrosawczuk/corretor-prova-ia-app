import type { FastifyRequest } from 'fastify'
import {
	AdminSessionStaleError,
	AdminTwoFactorRequiredError,
	ForbiddenError,
} from '@/core/errors'
import { auth } from './auth'
import { getAuthenticatedUser } from './get-authenticated-user'
import { toFetchHeaders } from './http-utils'

export const ADMIN_SESSION_FRESH_MINUTES = 30

export function isSessionFreshForAdmin(sessionCreatedAt: Date | string) {
	const ageMs = Date.now() - new Date(sessionCreatedAt).getTime()
	return ageMs <= ADMIN_SESSION_FRESH_MINUTES * 60_000
}

export async function getAuthenticatedAdmin(request: FastifyRequest) {
	const user = await getAuthenticatedUser(request)

	if (user.role !== 'admin') {
		throw new ForbiddenError('Acesso restrito a administradores.')
	}

	if (!user.twoFactorEnabled) {
		throw new AdminTwoFactorRequiredError()
	}

	const session = await auth.api.getSession({
		headers: toFetchHeaders(request.headers),
	})

	if (!session || !isSessionFreshForAdmin(session.session.createdAt)) {
		throw new AdminSessionStaleError()
	}

	return user
}
