import { db, user } from '@app/db'
import { eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { InvalidCredentialsError } from '@/core/errors'
import { auth } from '@/lib/auth'
import type { SignInWithEmailInput } from './sign-in-with-email-schema'

export async function signInWithEmailModule(
	request: FastifyRequest<{ Body: SignInWithEmailInput }>,
	reply: FastifyReply,
) {
	const { email, password } = request.body

	const existingUser = await db.query.user.findFirst({
		where: eq(user.email, email),
	})

	if (!existingUser) {
		throw new InvalidCredentialsError('E-mail ou senha incorretos.')
	}

	const response = await auth.api.signInEmail({
		body: {
			email,
			password,
		},
	})

	return reply.status(200).send(response)
}
