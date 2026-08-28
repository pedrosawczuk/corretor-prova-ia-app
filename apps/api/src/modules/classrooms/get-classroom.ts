import { classroomsTable, db, eq } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import type { GetClassroomParams } from './get-classroom-schema'

export async function getClassroomModule(
	request: FastifyRequest<{ Params: GetClassroomParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { id } = request.params

	const [classroom] = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.id, id))

	if (!classroom || classroom.teacherId !== user.id) {
		throw new NotFoundError('Turma não encontrada.')
	}

	return reply.status(200).send(classroom)
}
