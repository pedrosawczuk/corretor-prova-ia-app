import type { FastifyInstance } from 'fastify'
import { recordAuditLog } from './audit-log'
import { sanitizePayload } from './sanitize-payload'

function resolveResourceType(routePath: string) {
	const [, firstSegment] = routePath.split('/')
	return firstSegment || null
}

function resolveResourceId(params: unknown) {
	if (!params || typeof params !== 'object') return null

	const values = Object.values(params as Record<string, unknown>)
	const last = values.at(-1)

	return typeof last === 'string' ? last : null
}

export function registerAuditLogHook(app: FastifyInstance) {
	app.addHook('onRequest', async (request) => {
		request.auditStartTime = process.hrtime.bigint()
	})

	app.addHook('onResponse', async (request, reply) => {
		const routePath = request.routeOptions.url
		if (!routePath || routePath.startsWith('/api/auth')) return

		const durationMs = request.auditStartTime
			? Number(process.hrtime.bigint() - request.auditStartTime) / 1_000_000
			: null

		const statusCode = reply.statusCode
		const outcome = statusCode < 400 ? 'success' : 'failure'
		const userAgent = request.headers['user-agent']

		await recordAuditLog({
			requestId: request.id,
			actorId: request.currentUser?.id ?? null,
			actorEmail: request.currentUser?.email ?? null,
			sessionId: request.currentSessionId ?? null,
			action: `${request.method} ${routePath}`,
			resourceType: resolveResourceType(routePath),
			resourceId: resolveResourceId(request.params),
			outcome,
			errorMessage:
				outcome === 'failure' ? (request.auditErrorMessage ?? null) : null,
			httpMethod: request.method,
			httpPath: request.url,
			requestPayload: sanitizePayload(request.body) ?? null,
			responseStatusCode: statusCode,
			ipAddress: request.ip ?? null,
			userAgent: userAgent ?? null,
			durationMs: durationMs === null ? null : Math.round(durationMs),
		})
	})
}
