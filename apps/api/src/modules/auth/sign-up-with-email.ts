import { db, user } from '@app/db'
import { eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError } from '@/core/errors'
import { auth } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/mail'
import type { SignUpWithEmailInput } from './sign-up-with-email-schema'

export async function signUpWithEmailModule(
	request: FastifyRequest<{ Body: SignUpWithEmailInput }>,
	reply: FastifyReply,
) {
	const { name, email, password } = request.body

	const existingUser = await db.query.user.findFirst({
		where: eq(user.email, email),
	})

	if (existingUser) {
		throw new ConflictError('E-mail já cadastrado no sistema.')
	}

	const response = await auth.api.signUpEmail({
		body: {
			name,
			email,
			password,
		},
	})

	await sendWelcomeEmail({
		to: email,
		name,
	})

	return reply.status(201).send(response)
}
