import { env } from '@app/env'
import type { ResendVerificationEmailInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/auth/http-utils'

export async function resendVerificationEmailModule(
	request: FastifyRequest<{ Body: ResendVerificationEmailInput }>,
	reply: FastifyReply,
) {
	const { email } = request.body

	const response = await auth.api.sendVerificationEmail({
		body: {
			email,
			callbackURL: `${env.WEB_URL}/verificar-email?email=${encodeURIComponent(email)}`,
		},
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
