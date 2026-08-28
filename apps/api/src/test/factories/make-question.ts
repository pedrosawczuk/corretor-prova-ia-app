import type { questionsTable } from '@app/db'
import { faker } from '@faker-js/faker'

type Question = typeof questionsTable.$inferSelect

export function makeQuestion(overrides: Partial<Question> = {}): Question {
	return {
		id: faker.string.uuid(),
		examId: faker.string.uuid(),
		order: 0,
		statement: faker.lorem.sentence(),
		type: 'multiple_choice',
		maxPoints: '1.00',
		expectedAnswer: null,
		...overrides,
	}
}
