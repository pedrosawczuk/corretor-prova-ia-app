import { classroomsTable, db, eq } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { getOrSetCache } from '@/lib/cache/redis'
import {
	CLASSROOM_CACHE_TTL_SECONDS,
	classroomCacheKey,
} from './classroom-cache'
import type { GetClassroomParams } from './get-classroom-schema'

export async function getClassroomModule(
	request: FastifyRequest<{ Params: GetClassroomParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { id } = request.params

	const classroom = await getOrSetCache(
		classroomCacheKey(id),
		CLASSROOM_CACHE_TTL_SECONDS,
		async () => {
			const [row] = await db
				.select()
				.from(classroomsTable)
				.where(eq(classroomsTable.id, id))

			return row ?? null
		},
	)

	if (!classroom || classroom.teacherId !== user.id) {
		throw new NotFoundError('Turma não encontrada.')
	}

	return reply.status(200).send(classroom)
}
