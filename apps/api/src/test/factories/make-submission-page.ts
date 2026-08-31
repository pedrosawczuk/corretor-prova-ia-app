import type { submissionPagesTable } from '@app/db'
import { faker } from '@faker-js/faker'

type SubmissionPage = typeof submissionPagesTable.$inferSelect

export function makeSubmissionPage(
	overrides: Partial<SubmissionPage> = {},
): SubmissionPage {
	return {
		id: faker.string.uuid(),
		submissionId: faker.string.uuid(),
		pageNumber: 1,
		imageUrl: `submission-pages/${faker.string.uuid()}`,
		rawOcrPayload: null,
		createdAt: faker.date.recent(),
		...overrides,
	}
}
