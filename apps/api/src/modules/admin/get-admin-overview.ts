import {
	asc,
	auditLogsTable,
	classroomsTable,
	countDistinct,
	db,
	desc,
	eq,
	examsTable,
	gt,
	gte,
	session as sessionTable,
	sql,
	subjectsTable,
	user as userTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'

const RECENT_AUDIT_LOGS_LIMIT = 10
const TOP_SUBJECTS_LIMIT = 6
const ACTIVITY_HISTORY_DAYS = 30

export async function getAdminOverviewModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const now = new Date()
	const activityHistoryStart = new Date(
		now.getTime() - ACTIVITY_HISTORY_DAYS * 24 * 60 * 60 * 1000,
	)

	const classroomsCountExpr = countDistinct(classroomsTable.id)
	const examsCountExpr = countDistinct(examsTable.id)

	const [
		[{ total: totalUsers }],
		[{ total: totalClassrooms }],
		[{ total: totalExams }],
		[{ total: totalSubjects }],
		[{ total: activeSessionsUsers }],
		[{ total: twoFactorEnabledUsers }],
		[{ total: finalizedExams }],
		recentAuditLogs,
		topSubjects,
		recentExams,
		recentUsers,
	] = await Promise.all([
		db.select({ total: sql<number>`count(*)::int` }).from(userTable),
		db.select({ total: sql<number>`count(*)::int` }).from(classroomsTable),
		db.select({ total: sql<number>`count(*)::int` }).from(examsTable),
		db.select({ total: sql<number>`count(*)::int` }).from(subjectsTable),
		db
			.select({ total: countDistinct(sessionTable.userId) })
			.from(sessionTable)
			.where(gt(sessionTable.expiresAt, now)),
		db
			.select({ total: sql<number>`count(*)::int` })
			.from(userTable)
			.where(sql`${userTable.twoFactorEnabled} = true`),
		db
			.select({ total: sql<number>`count(*)::int` })
			.from(examsTable)
			.where(sql`${examsTable.status} = 'finalized'`),
		db
			.select()
			.from(auditLogsTable)
			.orderBy(desc(auditLogsTable.createdAt))
			.limit(RECENT_AUDIT_LOGS_LIMIT),
		db
			.select({
				subject: subjectsTable.name,
				classroomsCount: classroomsCountExpr,
				examsCount: examsCountExpr,
			})
			.from(subjectsTable)
			.leftJoin(
				classroomsTable,
				eq(classroomsTable.subjectId, subjectsTable.id),
			)
			.leftJoin(examsTable, eq(examsTable.classroomId, classroomsTable.id))
			.groupBy(subjectsTable.id, subjectsTable.name)
			.orderBy(desc(examsCountExpr), desc(classroomsCountExpr))
			.limit(TOP_SUBJECTS_LIMIT),
		db
			.select({ createdAt: examsTable.createdAt })
			.from(examsTable)
			.where(gte(examsTable.createdAt, activityHistoryStart))
			.orderBy(asc(examsTable.createdAt)),
		db
			.select({ createdAt: userTable.createdAt })
			.from(userTable)
			.where(gte(userTable.createdAt, activityHistoryStart))
			.orderBy(asc(userTable.createdAt)),
	])

	return reply.status(200).send({
		totalUsers,
		totalClassrooms,
		totalExams,
		totalSubjects,
		activeSessionsUsers,
		twoFactorEnabledUsers,
		finalizedExams,
		recentAuditLogs,
		topSubjects: topSubjects.filter(
			(subject) => subject.classroomsCount > 0 || subject.examsCount > 0,
		),
		examsCreatedAt: recentExams.map((exam) => exam.createdAt),
		usersCreatedAt: recentUsers.map((recentUser) => recentUser.createdAt),
	})
}
