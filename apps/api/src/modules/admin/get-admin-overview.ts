import {
	auditLogsTable,
	classroomsTable,
	countDistinct,
	db,
	desc,
	examsTable,
	gt,
	session as sessionTable,
	sql,
	user as userTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'

const RECENT_AUDIT_LOGS_LIMIT = 10

export async function getAdminOverviewModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const now = new Date()

	const [
		[{ total: totalUsers }],
		[{ total: totalClassrooms }],
		[{ total: totalExams }],
		[{ total: activeSessionsUsers }],
		[{ total: twoFactorEnabledUsers }],
		recentAuditLogs,
	] = await Promise.all([
		db.select({ total: sql<number>`count(*)::int` }).from(userTable),
		db.select({ total: sql<number>`count(*)::int` }).from(classroomsTable),
		db.select({ total: sql<number>`count(*)::int` }).from(examsTable),
		db
			.select({ total: countDistinct(sessionTable.userId) })
			.from(sessionTable)
			.where(gt(sessionTable.expiresAt, now)),
		db
			.select({ total: sql<number>`count(*)::int` })
			.from(userTable)
			.where(sql`${userTable.twoFactorEnabled} = true`),
		db
			.select()
			.from(auditLogsTable)
			.orderBy(desc(auditLogsTable.createdAt))
			.limit(RECENT_AUDIT_LOGS_LIMIT),
	])

	return reply.status(200).send({
		totalUsers,
		totalClassrooms,
		totalExams,
		activeSessionsUsers,
		twoFactorEnabledUsers,
		recentAuditLogs,
	})
}
