import { db, eq, privilegedEmailsTable } from '@app/db'
import type { CreatePrivilegedEmailInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'

export async function createPrivilegedEmailModule(
	request: FastifyRequest<{ Body: CreatePrivilegedEmailInput }>,
	reply: FastifyReply,
) {
	const admin = await getAuthenticatedAdmin(request)
	const { email, note } = request.body

	const [existing] = await db
		.select({ id: privilegedEmailsTable.id })
		.from(privilegedEmailsTable)
		.where(eq(privilegedEmailsTable.email, email))

	if (existing) {
		throw new ConflictError('Este e-mail já está na lista de privilegiados.')
	}

	const [privilegedEmail] = await db
		.insert(privilegedEmailsTable)
		.values({ email, note: note || null, createdByUserId: admin.id })
		.returning({
			id: privilegedEmailsTable.id,
			email: privilegedEmailsTable.email,
			note: privilegedEmailsTable.note,
			createdAt: privilegedEmailsTable.createdAt,
		})

	return reply.status(201).send({ ...privilegedEmail, claimedAt: null })
}
