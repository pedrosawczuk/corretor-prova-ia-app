import { classroomsTable, count, db, eq, subjectsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError, NotFoundError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import type { GetAdminSubjectParams } from './get-admin-subject-schema'

export async function deleteAdminSubjectModule(
	request: FastifyRequest<{ Params: GetAdminSubjectParams }>,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)
	const { id } = request.params

	const [existing] = await db
		.select()
		.from(subjectsTable)
		.where(eq(subjectsTable.id, id))

	if (!existing) {
		throw new NotFoundError('Disciplina não encontrada.')
	}

	const [{ total }] = await db
		.select({ total: count() })
		.from(classroomsTable)
		.where(eq(classroomsTable.subjectId, id))

	if (total > 0) {
		throw new ConflictError(
			`Não é possível excluir: ${total} turma(s) usam esta disciplina.`,
		)
	}

	await db.delete(subjectsTable).where(eq(subjectsTable.id, id))

	return reply.status(204).send()
}
