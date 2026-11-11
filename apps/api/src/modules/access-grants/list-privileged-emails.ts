import {
	accessGrantsTable,
	db,
	desc,
	eq,
	inArray,
	privilegedEmailsTable,
	user as userTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'

export async function listPrivilegedEmailsModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await getAuthenticatedAdmin(request)

	const privilegedEmails = await db
		.select({
			id: privilegedEmailsTable.id,
			email: privilegedEmailsTable.email,
			note: privilegedEmailsTable.note,
			createdAt: privilegedEmailsTable.createdAt,
		})
		.from(privilegedEmailsTable)
		.orderBy(desc(privilegedEmailsTable.createdAt))

	const emails = privilegedEmails.map((row) => row.email)

	const claimedRows = emails.length
		? await db
				.select({
					email: userTable.email,
					claimedAt: accessGrantsTable.startsAt,
				})
				.from(accessGrantsTable)
				.innerJoin(userTable, eq(accessGrantsTable.userId, userTable.id))
				.where(inArray(userTable.email, emails))
		: []

	const claimedAtByEmail = new Map(
		claimedRows.map((row) => [row.email, row.claimedAt]),
	)

	return reply.status(200).send({
		data: privilegedEmails.map((row) => ({
			...row,
			claimedAt: claimedAtByEmail.get(row.email) ?? null,
		})),
	})
}
