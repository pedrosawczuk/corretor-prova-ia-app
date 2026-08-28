import type { CreateExamInput } from '@app/shared'
import { faker } from '@faker-js/faker'

export function makeCreateExamInput(
	overrides: Partial<CreateExamInput> = {},
): CreateExamInput {
	return {
		classroomId: faker.string.uuid(),
		title: `Prova de ${faker.word.noun()}`,
		description: faker.lorem.sentence(),
		...overrides,
	}
}
