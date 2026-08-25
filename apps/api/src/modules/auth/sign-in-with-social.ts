import { auth } from '@/lib/auth'
import type { FastifyReply, FastifyRequest } from 'fastify'
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
	})

	return reply.status(200).send(response)
}
