import { asc, count, db, subjectsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import type { ListAdminSubjectsQuery } from './list-admin-subjects-schema'

export async function listAdminSubjectsModule(
	request: FastifyRequest<{ Querystring: ListAdminSubjectsQuery }>,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const { page, pageSize } = request.query

	const [totalResult, subjects] = await Promise.all([
		db.select({ total: count() }).from(subjectsTable),
		db
			.select()
			.from(subjectsTable)
			.orderBy(asc(subjectsTable.name))
			.limit(pageSize)
			.offset((page - 1) * pageSize),
	])

	const total = totalResult[0].total

	return reply.status(200).send({
		data: subjects,
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.ceil(total / pageSize),
		},
	})
}
