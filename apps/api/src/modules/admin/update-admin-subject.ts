import { db, eq, subjectsTable } from '@app/db'
import type { CreateSubjectInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError, NotFoundError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import type { GetAdminSubjectParams } from './get-admin-subject-schema'

export async function updateAdminSubjectModule(
	request: FastifyRequest<{
		Params: GetAdminSubjectParams
		Body: CreateSubjectInput
	}>,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)
	const { id } = request.params
	const { name } = request.body

	const [existing] = await db
		.select()
		.from(subjectsTable)
		.where(eq(subjectsTable.id, id))

	if (!existing) {
		throw new NotFoundError('Disciplina não encontrada.')
	}

	const [conflicting] = await db
		.select()
		.from(subjectsTable)
		.where(eq(subjectsTable.name, name))

	if (conflicting && conflicting.id !== id) {
		throw new ConflictError('Já existe uma disciplina com esse nome.')
	}

	const [subject] = await db
		.update(subjectsTable)
		.set({ name, updatedAt: new Date() })
		.where(eq(subjectsTable.id, id))
		.returning()

	return reply.status(200).send(subject)
}
