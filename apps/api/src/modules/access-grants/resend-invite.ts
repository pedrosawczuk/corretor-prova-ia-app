import { db, eq, invitesTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError, NotFoundError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import { deriveInviteStatus } from './derive-invite-status'
import { buildInviteCredentials, deliverInviteEmail } from './issue-invite'
import type { ResourceIdParams } from './resource-id-params-schema'

export async function resendInviteModule(
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

	const status = deriveInviteStatus(existing)

	if (status === 'accepted' || status === 'revoked') {
		throw new ConflictError('Este convite não pode mais ser reenviado.')
	}

	const credentials = buildInviteCredentials()

	const [invite] = await db
		.update(invitesTable)
		.set({
			tokenHash: credentials.tokenHash,
			expiresAt: credentials.expiresAt,
		})
		.where(eq(invitesTable.id, id))
		.returning()

	await deliverInviteEmail(invite.email, credentials.token)

	return reply.status(200).send({
		id: invite.id,
		email: invite.email,
		status: deriveInviteStatus(invite),
		expiresAt: invite.expiresAt,
		acceptedAt: invite.acceptedAt,
		revokedAt: invite.revokedAt,
		createdAt: invite.createdAt,
	})
}
