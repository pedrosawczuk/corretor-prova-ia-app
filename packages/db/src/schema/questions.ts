import {
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	uuid,
} from 'drizzle-orm/pg-core'
import { examsTable } from './exams'

export const questionTypeEnum = pgEnum('question_type', [
	'multiple_choice',
	'true_false',
])

export const questionsTable = pgTable(
	'questions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		examId: uuid('exam_id')
			.notNull()
			.references(() => examsTable.id, { onDelete: 'cascade' }),
		order: integer('order').notNull(),
		statement: text('statement').notNull(),
		type: questionTypeEnum('type').notNull(),
		maxPoints: numeric('max_points', { precision: 5, scale: 2 }).notNull(),
		expectedAnswer: text('expected_answer'),
	},
	(table) => [index('questions_exam_id_idx').on(table.examId)],
)
