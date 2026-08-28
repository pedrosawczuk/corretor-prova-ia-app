import type { RevokeSessionInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function revokeSessionModule(
	request: FastifyRequest<{ Body: RevokeSessionInput }>,
	reply: FastifyReply,
) {
	const { token } = request.body

	const response = await auth.api.revokeSession({
		body: { token },
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
