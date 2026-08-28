import type { examsTable } from '@app/db'
import { faker } from '@faker-js/faker'

type Exam = typeof examsTable.$inferSelect

export function makeExam(overrides: Partial<Exam> = {}): Exam {
	return {
		id: faker.string.uuid(),
		title: `Prova de ${faker.word.noun()}`,
		description: faker.lorem.sentence(),
		totalPoints: '10.00',
		status: 'draft',
		classroomId: faker.string.uuid(),
		creatorId: faker.string.uuid(),
		templatePdfUrl: null,
		createdAt: faker.date.recent(),
		updatedAt: faker.date.recent(),
		...overrides,
	}
}
