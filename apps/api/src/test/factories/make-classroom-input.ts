import type { CreateClassroomInput } from '@app/shared'
import { faker } from '@faker-js/faker'

const SUBJECTS = [
	'Matemática',
	'Português',
	'História',
	'Geografia',
	'Física',
	'Química',
	'Biologia',
]

export function makeClassroomInput(
	overrides: Partial<CreateClassroomInput> = {},
): CreateClassroomInput {
	return {
		name: `Turma ${faker.string.alpha({ length: 1, casing: 'upper' })} - ${faker.word.noun()}`,
		subject: faker.helpers.arrayElement(SUBJECTS),
		description: faker.lorem.sentence(),
		...overrides,
	}
}
