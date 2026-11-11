import { db, eq, privilegedEmailsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import type { ResourceIdParams } from './resource-id-params-schema'

export async function deletePrivilegedEmailModule(
	request: FastifyRequest<{ Params: ResourceIdParams }>,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)
	const { id } = request.params

	const [deleted] = await db
		.delete(privilegedEmailsTable)
		.where(eq(privilegedEmailsTable.id, id))
		.returning({ id: privilegedEmailsTable.id })

	if (!deleted) {
		throw new NotFoundError('E-mail privilegiado não encontrado.')
	}

	return reply.status(204).send()
}
