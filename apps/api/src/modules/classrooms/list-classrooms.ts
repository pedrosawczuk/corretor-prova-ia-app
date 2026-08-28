import { classroomsTable, db, desc, eq } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

export async function listClassroomsModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)

	const classrooms = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.teacherId, user.id))
		.orderBy(desc(classroomsTable.createdAt))

	return reply.status(200).send(classrooms)
}
