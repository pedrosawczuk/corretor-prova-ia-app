import { classroomsTable, db } from '@app/db'
import type { CreateClassroomInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

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

	return reply.status(201).send(classroom)
}
