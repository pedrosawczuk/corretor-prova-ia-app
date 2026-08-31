import type { submissionAnswersTable } from '@app/db'
import { faker } from '@faker-js/faker'

type SubmissionAnswer = typeof submissionAnswersTable.$inferSelect

export function makeSubmissionAnswer(
	overrides: Partial<SubmissionAnswer> = {},
): SubmissionAnswer {
	return {
		id: faker.string.uuid(),
		submissionId: faker.string.uuid(),
		questionId: faker.string.uuid(),
		markedOptionId: null,
		extractedText: null,
		aiScore: null,
		finalScore: null,
		aiFeedback: null,
		confidence: null,
		requiresReview: true,
		reviewedBy: null,
		createdAt: faker.date.recent(),
		...overrides,
	}
}
