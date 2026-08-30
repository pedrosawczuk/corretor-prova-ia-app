import { auditLogsTable, db, desc } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'

const AUDIT_LOGS_LIST_LIMIT = 100

export async function listAdminAuditLogsModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const auditLogs = await db
		.select()
		.from(auditLogsTable)
		.orderBy(desc(auditLogsTable.createdAt))
		.limit(AUDIT_LOGS_LIST_LIMIT)

	return reply.status(200).send(auditLogs)
}
