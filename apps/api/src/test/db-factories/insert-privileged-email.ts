import { db, privilegedEmailsTable } from '@app/db'
import { faker } from '@faker-js/faker'

type PrivilegedEmail = typeof privilegedEmailsTable.$inferSelect

export async function insertPrivilegedEmail(
	overrides: Partial<PrivilegedEmail> = {},
) {
	const [row] = await db
		.insert(privilegedEmailsTable)
		.values({
			email: faker.internet.email().toLowerCase(),
			...overrides,
		})
		.returning()

	return row
}
