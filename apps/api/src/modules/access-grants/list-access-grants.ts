import {
	accessGrantsTable,
	db,
	desc,
	eq,
	plansTable,
	user as userTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import { deriveAccessGrantStatus } from './derive-access-grant-status'

export async function listAccessGrantsModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const grants = await db
		.select({
			id: accessGrantsTable.id,
			source: accessGrantsTable.source,
			startsAt: accessGrantsTable.startsAt,
			expiresAt: accessGrantsTable.expiresAt,
			revokedAt: accessGrantsTable.revokedAt,
			userName: userTable.name,
			userEmail: userTable.email,
			planName: plansTable.name,
		})
		.from(accessGrantsTable)
		.innerJoin(userTable, eq(accessGrantsTable.userId, userTable.id))
		.innerJoin(plansTable, eq(accessGrantsTable.planId, plansTable.id))
		.orderBy(desc(accessGrantsTable.startsAt))

	const now = new Date()

	return reply.status(200).send({
		data: grants.map((grant) => ({
			...grant,
			status: deriveAccessGrantStatus(grant, now),
		})),
	})
}
