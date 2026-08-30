import type { CreateSubjectInput } from '@app/shared'
import { faker } from '@faker-js/faker'

export function makeSubjectInput(
	overrides: Partial<CreateSubjectInput> = {},
): CreateSubjectInput {
	return {
		name: faker.helpers.arrayElement([
			'Matemática',
			'Português',
			'História',
			'Geografia',
			'Física',
			'Química',
			'Biologia',
		]),
		...overrides,
	}
}
