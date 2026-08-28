import type { UpdatePasswordInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function updatePasswordModule(
	request: FastifyRequest<{ Body: UpdatePasswordInput }>,
	reply: FastifyReply,
) {
	const { currentPassword, newPassword } = request.body

	const response = await auth.api.changePassword({
		body: {
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		},
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
