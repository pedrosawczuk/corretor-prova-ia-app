import { classroomsTable, db, desc, eq, examsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { fetchQuestionsWithOptions } from './fetch-exam-detail'
import type { ListExamsQuery } from './list-exams-schema'

export async function listExamsModule(
	request: FastifyRequest<{ Querystring: ListExamsQuery }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { classroomId } = request.query

	const [classroom] = await db
		.select()
		.from(classroomsTable)
		.where(eq(classroomsTable.id, classroomId))

	if (!classroom || classroom.teacherId !== user.id) {
		throw new NotFoundError('Turma não encontrada.')
	}

	const exams = await db
		.select()
		.from(examsTable)
		.where(eq(examsTable.classroomId, classroomId))
		.orderBy(desc(examsTable.createdAt))

	const examsWithQuestions = await Promise.all(
		exams.map(async (exam) => ({
			...exam,
			questions: await fetchQuestionsWithOptions(exam.id),
		})),
	)

	return reply.status(200).send(examsWithQuestions)
}
