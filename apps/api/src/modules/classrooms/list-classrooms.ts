import { classroomsTable, db, desc, eq } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { getOrSetCache } from '@/lib/cache/redis'
import {
	CLASSROOM_CACHE_TTL_SECONDS,
	classroomListCacheKey,
} from './classroom-cache'

export async function listClassroomsModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)

	const classrooms = await getOrSetCache(
		classroomListCacheKey(user.id),
		CLASSROOM_CACHE_TTL_SECONDS,
		async () => {
			return db
				.select()
				.from(classroomsTable)
				.where(eq(classroomsTable.teacherId, user.id))
				.orderBy(desc(classroomsTable.createdAt))
		},
	)

	return reply.status(200).send(classrooms)
}
