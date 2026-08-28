import type { UpdateProfileInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function updateProfileModule(
	request: FastifyRequest<{ Body: UpdateProfileInput }>,
	reply: FastifyReply,
) {
	const { name } = request.body

	const response = await auth.api.updateUser({
		body: { name },
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
