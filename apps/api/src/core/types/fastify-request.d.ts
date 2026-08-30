import 'fastify'

declare module 'fastify' {
	interface FastifyRequest {
		currentUser?: {
			id: string
			email: string
		}
		currentSessionId?: string
		auditStartTime?: bigint
		auditErrorMessage?: string
	}
}
