import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/auth/http-utils'

export async function revokeOtherSessionsModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const response = await auth.api.revokeOtherSessions({
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
