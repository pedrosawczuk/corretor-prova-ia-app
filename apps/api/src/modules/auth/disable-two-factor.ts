import type { DisableTwoFactorInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function disableTwoFactorModule(
	request: FastifyRequest<{ Body: DisableTwoFactorInput }>,
	reply: FastifyReply,
) {
	const { password } = request.body

	const response = await auth.api.disableTwoFactor({
		body: { password },
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
