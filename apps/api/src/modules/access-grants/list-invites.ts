import { db, desc, invitesTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import { deriveInviteStatus } from './derive-invite-status'

const MAX_LISTED_INVITES = 500

export async function listInvitesModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const invites = await db
		.select({
			id: invitesTable.id,
			email: invitesTable.email,
			expiresAt: invitesTable.expiresAt,
			acceptedAt: invitesTable.acceptedAt,
			revokedAt: invitesTable.revokedAt,
			createdAt: invitesTable.createdAt,
		})
		.from(invitesTable)
		.orderBy(desc(invitesTable.createdAt))
		.limit(MAX_LISTED_INVITES)

	const now = new Date()

	return reply.status(200).send({
		data: invites.map((invite) => ({
			...invite,
			status: deriveInviteStatus(invite, now),
		})),
	})
}
