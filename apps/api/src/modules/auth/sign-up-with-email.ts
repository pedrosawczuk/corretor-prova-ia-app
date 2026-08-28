import type { SignUpWithEmailInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'
import { sendWelcomeEmail } from '@/lib/mail'

export async function signUpWithEmailModule(
	request: FastifyRequest<{ Body: SignUpWithEmailInput }>,
	reply: FastifyReply,
) {
	const { name, email, password } = request.body

	const response = await auth.api.signUpEmail({
		body: {
			name,
			email,
			password,
		},
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	sendWelcomeEmail({
		to: email,
		name,
	}).catch((err) => {
		request.log.error({ err }, 'Failed to send welcome email')
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
