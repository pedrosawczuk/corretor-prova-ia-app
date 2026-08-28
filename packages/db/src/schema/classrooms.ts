import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './users'

export const classroomsTable = pgTable(
	'classrooms',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		subject: text('subject').notNull(),
		description: text('description'),
		teacherId: text('teacher_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [index('classrooms_teacher_id_idx').on(table.teacherId)],
)
