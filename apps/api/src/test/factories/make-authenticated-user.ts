import { faker } from '@faker-js/faker'

type AuthenticatedUser = {
	id: string
	name: string
	email: string
	emailVerified: boolean
	image: string | null
	createdAt: Date
	updatedAt: Date
}

export function makeAuthenticatedUser(
	overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
	return {
		id: faker.string.uuid(),
		name: faker.person.fullName(),
		email: faker.internet.email(),
		emailVerified: true,
		image: null,
		createdAt: faker.date.past(),
		updatedAt: faker.date.recent(),
		...overrides,
	}
}
