import {
	db,
	desc,
	eq,
	session as sessionTable,
	user as userTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'

const SESSIONS_LIST_LIMIT = 300

export async function listAdminSessionsModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const now = new Date()

	const sessions = await db
		.select({
			id: sessionTable.id,
			userId: sessionTable.userId,
			userName: userTable.name,
			userEmail: userTable.email,
			ipAddress: sessionTable.ipAddress,
			userAgent: sessionTable.userAgent,
			createdAt: sessionTable.createdAt,
			updatedAt: sessionTable.updatedAt,
			expiresAt: sessionTable.expiresAt,
		})
		.from(sessionTable)
		.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
		.orderBy(desc(sessionTable.createdAt))
		.limit(SESSIONS_LIST_LIMIT)

	const result = sessions.map((session) => ({
		...session,
		isActive: session.expiresAt > now,
	}))

	return reply.status(200).send(result)
}
