import { env } from '@app/env'
import type { SignUpWithEmailInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/auth/http-utils'
import { sendWelcomeEmail } from '@/lib/mail/mail'

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
			callbackURL: `${env.WEB_URL}/verificar-email?email=${encodeURIComponent(email)}`,
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

	const data = (await response.json()) as {
		user?: { id: string; email: string }
	}

	if (data.user?.id && data.user?.email) {
		request.currentUser = { id: data.user.id, email: data.user.email }
	}

	return reply.status(response.status).send(data)
}
