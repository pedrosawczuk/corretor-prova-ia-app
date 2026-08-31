import type { submissionsTable } from '@app/db'
import { faker } from '@faker-js/faker'

type Submission = typeof submissionsTable.$inferSelect

export function makeSubmission(
	overrides: Partial<Submission> = {},
): Submission {
	return {
		id: faker.string.uuid(),
		examId: faker.string.uuid(),
		studentIdentifier: null,
		totalScore: null,
		status: 'pending_processing',
		correctedAt: null,
		createdAt: faker.date.recent(),
		...overrides,
	}
}
