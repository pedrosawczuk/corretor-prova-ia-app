import {
	classroomsTable,
	count,
	db,
	desc,
	examsTable,
	max,
	session as sessionTable,
	user as userTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import type { ListAdminUsersQuery } from './list-admin-users-schema'

export async function listAdminUsersModule(
	request: FastifyRequest<{ Querystring: ListAdminUsersQuery }>,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const { page, pageSize } = request.query

	const [totalResult, users, classroomCounts, examCounts, lastSessions] =
		await Promise.all([
			db.select({ total: count() }).from(userTable),
			db
				.select({
					id: userTable.id,
					name: userTable.name,
					email: userTable.email,
					role: userTable.role,
					banned: userTable.banned,
					emailVerified: userTable.emailVerified,
					twoFactorEnabled: userTable.twoFactorEnabled,
					createdAt: userTable.createdAt,
				})
				.from(userTable)
				.orderBy(desc(userTable.createdAt))
				.limit(pageSize)
				.offset((page - 1) * pageSize),
			db
				.select({ teacherId: classroomsTable.teacherId, total: count() })
				.from(classroomsTable)
				.groupBy(classroomsTable.teacherId),
			db
				.select({ creatorId: examsTable.creatorId, total: count() })
				.from(examsTable)
				.groupBy(examsTable.creatorId),
			db
				.select({
					userId: sessionTable.userId,
					lastSeenAt: max(sessionTable.updatedAt),
				})
				.from(sessionTable)
				.groupBy(sessionTable.userId),
		])

	const classroomCountByUser = new Map(
		classroomCounts.map((row) => [row.teacherId, row.total]),
	)
	const examCountByUser = new Map(
		examCounts.map((row) => [row.creatorId, row.total]),
	)
	const lastSeenByUser = new Map(
		lastSessions.map((row) => [row.userId, row.lastSeenAt]),
	)

	const data = users.map((user) => ({
		...user,
		classroomsCount: classroomCountByUser.get(user.id) ?? 0,
		examsCount: examCountByUser.get(user.id) ?? 0,
		lastSeenAt: lastSeenByUser.get(user.id) ?? null,
	}))

	const total = totalResult[0].total

	return reply.status(200).send({
		data,
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.ceil(total / pageSize),
		},
	})
}
