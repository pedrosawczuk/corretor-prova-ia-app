import { accessGrantsTable, db, eq } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import type { ResourceIdParams } from './resource-id-params-schema'

export async function revokeAccessGrantModule(
	request: FastifyRequest<{ Params: ResourceIdParams }>,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)
	const { id } = request.params

	const [existing] = await db
		.select({ revokedAt: accessGrantsTable.revokedAt })
		.from(accessGrantsTable)
		.where(eq(accessGrantsTable.id, id))

	if (!existing) {
		throw new NotFoundError('Cortesia não encontrada.')
	}

	if (!existing.revokedAt) {
		await db
			.update(accessGrantsTable)
			.set({ revokedAt: new Date() })
			.where(eq(accessGrantsTable.id, id))
	}

	return reply.status(204).send()
}
