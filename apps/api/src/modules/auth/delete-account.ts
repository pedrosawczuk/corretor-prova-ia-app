import { db, eq, user as userTable } from '@app/db'
import type { DeleteAccountInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { BadRequestError } from '@/core/errors'
import { auth } from '@/lib/auth'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function deleteAccountModule(
	request: FastifyRequest<{ Body: DeleteAccountInput }>,
	reply: FastifyReply,
) {
	const authenticatedUser = await getAuthenticatedUser(request)
	const { email } = request.body

	if (authenticatedUser.email.toLowerCase() !== email.trim().toLowerCase()) {
		throw new BadRequestError(
			'O e-mail digitado não corresponde ao seu e-mail de cadastro.',
		)
	}

	await db.delete(userTable).where(eq(userTable.id, authenticatedUser.id))

	const response = await auth.api.signOut({
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	return reply.status(200).send({ message: 'Conta deletada com sucesso.' })
}
