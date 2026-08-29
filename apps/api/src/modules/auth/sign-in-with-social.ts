import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/auth/http-utils'
import type { SignInWithSocialInput } from './sign-in-with-social-schema'

export async function signInWithSocialModule(
	request: FastifyRequest<{ Body: SignInWithSocialInput }>,
	reply: FastifyReply,
) {
	const { provider, callbackURL } = request.body

	const response = await auth.api.signInSocial({
		body: {
			provider,
			callbackURL,
		},
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
