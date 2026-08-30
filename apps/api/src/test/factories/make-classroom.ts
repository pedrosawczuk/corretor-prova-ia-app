import type { classroomsTable } from '@app/db'
import { faker } from '@faker-js/faker'

type Classroom = typeof classroomsTable.$inferSelect

export function makeClassroom(overrides: Partial<Classroom> = {}): Classroom {
	return {
		id: faker.string.uuid(),
		name: `Turma ${faker.string.alpha({ length: 1, casing: 'upper' })} - ${faker.word.noun()}`,
		subjectId: faker.string.uuid(),
		description: faker.lorem.sentence(),
		teacherId: faker.string.uuid(),
		createdAt: faker.date.recent(),
		updatedAt: faker.date.recent(),
		...overrides,
	}
}
