import type { ResetPasswordInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function resetPasswordModule(
	request: FastifyRequest<{ Body: ResetPasswordInput }>,
	reply: FastifyReply,
) {
	const { token, password } = request.body

	const response = await auth.api.resetPassword({
		body: {
			newPassword: password,
			token,
		},
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
