import { classroomsTable, db, eq } from '@app/db'
import type { CreateClassroomInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { invalidateClassroomCache } from './classroom-cache'
import type { GetClassroomParams } from './get-classroom-schema'

export async function updateClassroomModule(
	request: FastifyRequest<{
		Params: GetClassroomParams
		Body: CreateClassroomInput
	}>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { id } = request.params
	const { name, subjectId, description } = request.body

	const [existing] = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.id, id))

	if (!existing || existing.teacherId !== user.id) {
		throw new NotFoundError('Turma não encontrada.')
	}

	const [classroom] = await db
		.update(classroomsTable)
		.set({ name, subjectId, description, updatedAt: new Date() })
		.where(eq(classroomsTable.id, id))
		.returning()

	await invalidateClassroomCache(id, user.id)

	return reply.status(200).send(classroom)
}
