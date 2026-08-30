import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { subjectsTable } from './subjects'
import { user } from './users'

export const classroomsTable = pgTable(
	'classrooms',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		subjectId: uuid('subject_id')
			.notNull()
			.references(() => subjectsTable.id),
		description: text('description'),
		teacherId: text('teacher_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [
		index('classrooms_teacher_id_idx').on(table.teacherId),
		index('classrooms_subject_id_idx').on(table.subjectId),
	],
)
