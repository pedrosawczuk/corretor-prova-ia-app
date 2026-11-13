import { env } from '@app/env'
import type { DeleteAccountInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { BadRequestError } from '@/core/errors'
import { auth } from '@/lib/auth/auth'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { forwardWebResponse, toFetchHeaders } from '@/lib/auth/http-utils'

export async function deleteAccountModule(
	request: FastifyRequest<{ Body: DeleteAccountInput }>,
	reply: FastifyReply,
) {
	const authenticatedUser = await getAuthenticatedUser(request)
	const { email, password } = request.body

	if (authenticatedUser.email.toLowerCase() !== email.trim().toLowerCase()) {
		throw new BadRequestError(
			'O e-mail digitado não corresponde ao seu e-mail de cadastro.',
		)
	}

	const response = await auth.api.deleteUser({
		body: {
			...(password ? { password } : {}),
			callbackURL: `${env.WEB_URL}/entrar`,
		},
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	if (!response.ok) {
		const data = await response.json()
		return reply.status(response.status).send(data)
	}

	if (!password) {
		return reply.status(200).send({
			message: 'Enviamos um e-mail de confirmação para excluir sua conta.',
			requiresEmailVerification: true,
		})
	}

	return reply.status(200).send({
		message: 'Conta deletada com sucesso.',
		requiresEmailVerification: false,
	})
}
