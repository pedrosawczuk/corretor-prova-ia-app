import type { questionOptionsTable } from '@app/db'
import { faker } from '@faker-js/faker'

type QuestionOption = typeof questionOptionsTable.$inferSelect

export function makeQuestionOption(
	overrides: Partial<QuestionOption> = {},
): QuestionOption {
	return {
		id: faker.string.uuid(),
		questionId: faker.string.uuid(),
		letter: 'A',
		text: faker.lorem.words(3),
		isCorrect: false,
		markerPage: null,
		markerX: null,
		markerY: null,
		...overrides,
	}
}
