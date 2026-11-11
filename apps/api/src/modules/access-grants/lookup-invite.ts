import { db, eq, invitesTable, user as userTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ACCESS_GRANT_DURATION_MONTHS } from './access-grant-constants'
import { deriveInviteStatus } from './derive-invite-status'
import { hashInviteToken } from './invite-token'
import type { LookupInviteBody } from './lookup-invite-schema'

export async function lookupInviteModule(
	request: FastifyRequest<{ Body: LookupInviteBody }>,
	reply: FastifyReply,
) {
	const [invite] = await db
		.select()
		.from(invitesTable)
		.where(eq(invitesTable.tokenHash, hashInviteToken(request.body.token)))

	if (!invite) {
		return reply.status(200).send({ status: 'not_found' })
	}

	const status = deriveInviteStatus(invite)

	if (status !== 'pending') {
		return reply.status(200).send({ status })
	}

	const [existingUser] = await db
		.select({ id: userTable.id })
		.from(userTable)
		.where(eq(userTable.email, invite.email))

	return reply.status(200).send({
		status,
		email: invite.email,
		hasAccount: Boolean(existingUser),
		grantDurationMonths: ACCESS_GRANT_DURATION_MONTHS,
		expiresAt: invite.expiresAt,
	})
}
