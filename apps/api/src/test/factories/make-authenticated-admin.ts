import { faker } from '@faker-js/faker'

type AuthenticatedAdmin = {
	id: string
	name: string
	email: string
	role: string
	twoFactorEnabled: boolean
}

export function makeAuthenticatedAdmin(
	overrides: Partial<AuthenticatedAdmin> = {},
): AuthenticatedAdmin {
	return {
		id: faker.string.uuid(),
		name: faker.person.fullName(),
		email: faker.internet.email(),
		role: 'admin',
		twoFactorEnabled: true,
		...overrides,
	}
}
