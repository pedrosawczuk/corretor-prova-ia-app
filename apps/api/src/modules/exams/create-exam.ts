import { classroomsTable, db, eq, examsTable } from '@app/db'
import type { CreateExamInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

export async function createExamModule(
	request: FastifyRequest<{ Body: CreateExamInput }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { classroomId, title, description } = request.body

	const [classroom] = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.id, classroomId))

	if (!classroom || classroom.teacherId !== user.id) {
		throw new NotFoundError('Turma não encontrada.')
	}

	const [exam] = await db
		.insert(examsTable)
		.values({
			title,
			description,
			totalPoints: '0.00',
			status: 'draft',
			classroomId,
			creatorId: user.id,
		})
		.returning()

	return reply.status(201).send({ ...exam, questions: [] })
}
