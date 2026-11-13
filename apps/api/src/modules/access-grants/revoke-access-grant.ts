import {
	accessGrantsTable,
	db,
	eq,
	privilegedEmailsTable,
	user as userTable,
} from '@app/db'
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
		.select({
			revokedAt: accessGrantsTable.revokedAt,
			source: accessGrantsTable.source,
			userId: accessGrantsTable.userId,
		})
		.from(accessGrantsTable)
		.where(eq(accessGrantsTable.id, id))

	if (!existing) {
		throw new NotFoundError('Cortesia não encontrada.')
	}

	if (!existing.revokedAt) {
		const now = new Date()
		let privilegedEmailAddress: string | null = null

		if (existing.source === 'privileged_email') {
			const [grantUser] = await db
				.select({ email: userTable.email })
				.from(userTable)
				.where(eq(userTable.id, existing.userId))

			if (grantUser) {
				privilegedEmailAddress = grantUser.email.trim().toLowerCase()
			}
		}

		await db.transaction(async (tx) => {
			await tx
				.update(accessGrantsTable)
				.set({ revokedAt: now })
				.where(eq(accessGrantsTable.id, id))

			if (privilegedEmailAddress) {
				await tx
					.update(privilegedEmailsTable)
					.set({ revokedAt: now })
					.where(eq(privilegedEmailsTable.email, privilegedEmailAddress))
			}
		})
	}

	return reply.status(204).send()
}
