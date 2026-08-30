import { db, eq, subjectsTable } from '@app/db'
import type { CreateSubjectInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'

export async function createAdminSubjectModule(
	request: FastifyRequest<{ Body: CreateSubjectInput }>,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)
	const { name } = request.body

	const [existing] = await db
		.select()
		.from(subjectsTable)
		.where(eq(subjectsTable.name, name))

	if (existing) {
		throw new ConflictError('Já existe uma disciplina com esse nome.')
	}

	const [subject] = await db
		.insert(subjectsTable)
		.values({ name })
		.returning()

	return reply.status(201).send(subject)
}
