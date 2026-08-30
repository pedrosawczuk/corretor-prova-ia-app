import type { FastifyReply, FastifyRequest } from 'fastify'
import { recordAuditLog } from '@/lib/audit/audit-log'
import { auth } from './auth'
import { isSessionFreshForAdmin } from './get-authenticated-admin'
import { toFetchHeaders } from './http-utils'

const ADMIN_AUTH_PATH_PREFIX = '/api/auth/admin'

/**
 * better-auth's `admin` plugin registers privileged endpoints (set-role,
 * ban-user, impersonate-user, etc.) under /api/auth/admin/* on the generic
 * better-auth catch-all. Those endpoints only enforce better-auth's own
 * role check, bypassing this app's 2FA and session-freshness requirements
 * for admins, and the catch-all is excluded from audit logging. This guard
 * closes both gaps before the request ever reaches better-auth's handler.
 */
export function isAdminAuthRoute(url: string) {
	return url.startsWith(ADMIN_AUTH_PATH_PREFIX)
}

export async function guardAdminAuthRoute(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const session = await auth.api.getSession({
		headers: toFetchHeaders(request.headers),
	})

	const deny = async (statusCode: number, code: string, message: string) => {
		await recordAuditLog({
			requestId: request.id,
			actorId: session?.user.id ?? null,
			actorEmail: session?.user.email ?? null,
			sessionId: session?.session.id ?? null,
			action: `${request.method} ${request.url}`,
			resourceType: 'admin-auth',
			resourceId: null,
			outcome: 'failure',
			errorMessage: message,
			httpMethod: request.method,
			httpPath: request.url,
			requestPayload: null,
			responseStatusCode: statusCode,
			ipAddress: request.ip ?? null,
			userAgent: (request.headers['user-agent'] as string) ?? null,
			durationMs: null,
		})

		reply.status(statusCode).send({ code, message })
	}

	if (!session) {
		await deny(
			401,
			'UNAUTHORIZED',
			'Você precisa estar autenticado para continuar.',
		)
		return false
	}

	if (session.user.role !== 'admin') {
		await deny(403, 'FORBIDDEN', 'Acesso restrito a administradores.')
		return false
	}

	if (!session.user.twoFactorEnabled) {
		await deny(
			403,
			'ADMIN_TWO_FACTOR_REQUIRED',
			'Ative a verificação em duas etapas para acessar o painel administrativo.',
		)
		return false
	}

	if (!isSessionFreshForAdmin(session.session.createdAt)) {
		await deny(
			403,
			'ADMIN_SESSION_STALE',
			'Sua sessão expirou para o painel administrativo. Faça login novamente.',
		)
		return false
	}

	request.currentUser = { id: session.user.id, email: session.user.email }
	request.currentSessionId = session.session.id

	return true
}

export async function recordAdminAuthAuditLog(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const statusCode = reply.raw.statusCode

	await recordAuditLog({
		requestId: request.id,
		actorId: request.currentUser?.id ?? null,
		actorEmail: request.currentUser?.email ?? null,
		sessionId: request.currentSessionId ?? null,
		action: `${request.method} ${request.url}`,
		resourceType: 'admin-auth',
		resourceId: null,
		outcome: statusCode < 400 ? 'success' : 'failure',
		errorMessage: null,
		httpMethod: request.method,
		httpPath: request.url,
		requestPayload: null,
		responseStatusCode: statusCode,
		ipAddress: request.ip ?? null,
		userAgent: (request.headers['user-agent'] as string) ?? null,
		durationMs: null,
	})
}
