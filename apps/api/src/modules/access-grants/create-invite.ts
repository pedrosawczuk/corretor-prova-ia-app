import {
	accessGrantsTable,
	and,
	db,
	eq,
	invitesTable,
	isNull,
	user as userTable,
} from '@app/db'
import type { CreateInviteInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import { deriveInviteStatus } from './derive-invite-status'
import { buildInviteCredentials, deliverInviteEmail } from './issue-invite'

export async function createInviteModule(
	request: FastifyRequest<{ Body: CreateInviteInput }>,
	reply: FastifyReply,
) {
	const admin = await getAuthenticatedAdmin(request)
	const { email } = request.body

	const [grantedUser] = await db
		.select({ id: accessGrantsTable.id })
		.from(accessGrantsTable)
		.innerJoin(userTable, eq(accessGrantsTable.userId, userTable.id))
		.where(eq(userTable.email, email))

	if (grantedUser) {
		throw new ConflictError('Este e-mail já recebeu a cortesia.')
	}

	const [openInvite] = await db
		.select()
		.from(invitesTable)
		.where(
			and(
				eq(invitesTable.email, email),
				isNull(invitesTable.acceptedAt),
				isNull(invitesTable.revokedAt),
			),
		)

	if (openInvite && deriveInviteStatus(openInvite) === 'pending') {
		throw new ConflictError(
			'Já existe um convite pendente para este e-mail. Use a opção de reenviar.',
		)
	}

	const credentials = buildInviteCredentials()

	const [invite] = openInvite
		? await db
				.update(invitesTable)
				.set({
					tokenHash: credentials.tokenHash,
					expiresAt: credentials.expiresAt,
					invitedByUserId: admin.id,
				})
				.where(eq(invitesTable.id, openInvite.id))
				.returning()
		: await db
				.insert(invitesTable)
				.values({
					email,
					tokenHash: credentials.tokenHash,
					expiresAt: credentials.expiresAt,
					invitedByUserId: admin.id,
				})
				.returning()

	await deliverInviteEmail(email, credentials.token)

	return reply.status(201).send({
		id: invite.id,
		email: invite.email,
		status: deriveInviteStatus(invite),
		expiresAt: invite.expiresAt,
		acceptedAt: invite.acceptedAt,
		revokedAt: invite.revokedAt,
		createdAt: invite.createdAt,
	})
}
