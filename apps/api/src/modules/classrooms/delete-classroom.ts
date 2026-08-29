import { classroomsTable, db, eq } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateClassroomCache } from './classroom-cache'
import type { GetClassroomParams } from './get-classroom-schema'

export async function deleteClassroomModule(
	request: FastifyRequest<{ Params: GetClassroomParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { id } = request.params

	const [existing] = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.id, id))

	if (!existing || existing.teacherId !== user.id) {
		throw new NotFoundError('Turma não encontrada.')
	}

	await db.delete(classroomsTable).where(eq(classroomsTable.id, id))

	await invalidateClassroomCache(id, user.id)

	return reply.status(204).send()
}
