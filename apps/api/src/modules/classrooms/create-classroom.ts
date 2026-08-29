import { classroomsTable, db } from '@app/db'
import type { CreateClassroomInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateCache } from '@/lib/cache/redis'
import { classroomListCacheKey } from './classroom-cache'

export async function createClassroomModule(
	request: FastifyRequest<{ Body: CreateClassroomInput }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { name, subject, description } = request.body

	const [classroom] = await db
		.insert(classroomsTable)
		.values({
			name,
			subject,
			description,
			teacherId: user.id,
		})
		.returning()

	await invalidateCache(classroomListCacheKey(user.id))

	return reply.status(201).send(classroom)
}
