import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'
import type { SignInWithEmailInput } from './sign-in-with-email-schema'

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

	const data = await response.json()
	return reply.status(200).send(data)
}
