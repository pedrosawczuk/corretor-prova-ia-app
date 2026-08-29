import type { UpdateProfileInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/auth/http-utils'

export async function updateProfileModule(
	request: FastifyRequest<{ Body: UpdateProfileInput }>,
	reply: FastifyReply,
) {
	const { name, phoneNumber } = request.body

	const response = await auth.api.updateUser({
		body: { name, phoneNumber },
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
