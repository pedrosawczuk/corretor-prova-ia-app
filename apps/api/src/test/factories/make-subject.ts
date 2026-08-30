import type { subjectsTable } from '@app/db'
import { faker } from '@faker-js/faker'

type Subject = typeof subjectsTable.$inferSelect

export function makeSubject(overrides: Partial<Subject> = {}): Subject {
	return {
		id: faker.string.uuid(),
		name: faker.helpers.arrayElement([
			'Matemática',
			'Português',
			'História',
			'Geografia',
			'Física',
			'Química',
			'Biologia',
		]),
		createdAt: faker.date.recent(),
		updatedAt: faker.date.recent(),
		...overrides,
	}
}
