import type { GenerateExamInput } from '@app/shared'
import { faker } from '@faker-js/faker'

export function makeGenerateExamInput(
	overrides: Partial<GenerateExamInput> = {},
): GenerateExamInput {
	return {
		difficulty: faker.number.int({ min: 0, max: 10 }),
		questionCount: faker.number.int({ min: 1, max: 20 }),
		questionType: faker.helpers.arrayElement(['multiple_choice', 'true_false']),
		...overrides,
	}
}
