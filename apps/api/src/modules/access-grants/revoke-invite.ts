import { db, eq, invitesTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError, NotFoundError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import type { ResourceIdParams } from './resource-id-params-schema'

export async function revokeInviteModule(
	request: FastifyRequest<{ Params: ResourceIdParams }>,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)
	const { id } = request.params

	const [existing] = await db
		.select()
		.from(invitesTable)
		.where(eq(invitesTable.id, id))

	if (!existing) {
		throw new NotFoundError('Convite não encontrado.')
	}

	if (existing.acceptedAt) {
		throw new ConflictError(
			'Este convite já foi aceito. Para encerrar o acesso, revogue a cortesia.',
		)
	}

	if (!existing.revokedAt) {
		await db
			.update(invitesTable)
			.set({ revokedAt: new Date() })
			.where(eq(invitesTable.id, id))
	}

	return reply.status(204).send()
}
