import type { VerifyEmailQuery } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function verifyEmailModule(
	request: FastifyRequest<{ Querystring: VerifyEmailQuery }>,
	reply: FastifyReply,
) {
	const { token, callbackURL } = request.query

	const response = await auth.api.verifyEmail({
		query: { token, callbackURL },
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	if (response.status >= 300 && response.status < 400) {
		return reply.status(response.status).send()
	}

	const data = await response.json()
	return reply.status(response.status).send(data)
}
