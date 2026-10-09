import { db, user } from '@app/db'
import { faker } from '@faker-js/faker'

type User = typeof user.$inferInsert

export async function insertUser(overrides: Partial<User> = {}) {
	const [row] = await db
		.insert(user)
		.values({
			id: faker.string.uuid(),
			name: faker.person.fullName(),
			email: faker.internet.email().toLowerCase(),
			emailVerified: true,
			...overrides,
		})
		.returning()

	return row
}
