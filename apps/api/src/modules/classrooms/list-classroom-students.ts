import {
	and,
	classroomsTable,
	db,
	desc,
	eq,
	examsTable,
	isNotNull,
	sql,
	submissionsTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import type { ListClassroomStudentsParams } from './list-classroom-students-schema'

export async function listClassroomStudentsModule(
	request: FastifyRequest<{ Params: ListClassroomStudentsParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { classroomId } = request.params

	const [classroom] = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.id, classroomId))

	if (!classroom || classroom.teacherId !== user.id) {
		throw new NotFoundError('Turma não encontrada.')
	}

	const rows = await db
		.select({
			studentIdentifier: submissionsTable.studentIdentifier,
		})
		.from(submissionsTable)
		.innerJoin(examsTable, eq(examsTable.id, submissionsTable.examId))
		.where(
			and(
				eq(examsTable.classroomId, classroomId),
				isNotNull(submissionsTable.studentIdentifier),
			),
		)
		.groupBy(submissionsTable.studentIdentifier)
		.orderBy(desc(sql`max(${submissionsTable.createdAt})`))

	const students = rows
		.map((row) => row.studentIdentifier)
		.filter((id): id is string => Boolean(id))

	return reply.status(200).send(students)
}
