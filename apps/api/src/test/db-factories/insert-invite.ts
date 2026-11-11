import { db, invitesTable } from '@app/db'
import { faker } from '@faker-js/faker'

type Invite = typeof invitesTable.$inferSelect

const DAY_MS = 1000 * 60 * 60 * 24

export async function insertInvite(overrides: Partial<Invite> = {}) {
	const [row] = await db
		.insert(invitesTable)
		.values({
			email: faker.internet.email().toLowerCase(),
			tokenHash: faker.string.hexadecimal({ length: 64, prefix: '' }),
			expiresAt: new Date(Date.now() + 14 * DAY_MS),
			...overrides,
		})
		.returning()

	return row
}
