import { asc, db, subjectsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'

export async function listSubjectsModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await getAuthenticatedUser(request)

	const subjects = await db
		.select()
		.from(subjectsTable)
		.orderBy(asc(subjectsTable.name))

	return reply.status(200).send(subjects)
}
