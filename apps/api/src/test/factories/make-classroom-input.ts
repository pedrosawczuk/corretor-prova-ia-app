import type { CreateClassroomInput } from '@app/shared'
import { faker } from '@faker-js/faker'

export function makeClassroomInput(
	overrides: Partial<CreateClassroomInput> = {},
): CreateClassroomInput {
	return {
		name: `Turma ${faker.string.alpha({ length: 1, casing: 'upper' })} - ${faker.word.noun()}`,
		subjectId: faker.string.uuid(),
		description: faker.lorem.sentence(),
		...overrides,
	}
}
