import type { SignInWithEmailInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/auth/http-utils'

export async function signInWithEmailModule(
	request: FastifyRequest<{ Body: SignInWithEmailInput }>,
	reply: FastifyReply,
) {
	const { email, password } = request.body

	const response = await auth.api.signInEmail({
		body: {
			email,
			password,
		},
		asResponse: true,
		headers: toFetchHeaders(request.headers),
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
