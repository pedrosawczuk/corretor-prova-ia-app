import { env } from '@app/env'
import type { ForgotPasswordInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function forgotPasswordModule(
	request: FastifyRequest<{ Body: ForgotPasswordInput }>,
	reply: FastifyReply,
) {
	const { email } = request.body

	const response = await auth.api.requestPasswordReset({
		body: {
			email,
			redirectTo: `${env.WEB_URL}/redefinir-senha`,
		},
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
