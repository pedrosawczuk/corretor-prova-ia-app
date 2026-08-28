import { boolean, char, index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { questionsTable } from './questions'

export const questionOptionsTable = pgTable(
	'question_options',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		questionId: uuid('question_id')
			.notNull()
			.references(() => questionsTable.id, { onDelete: 'cascade' }),
		letter: char('letter', { length: 1 }).notNull(),
		text: text('text').notNull(),
		isCorrect: boolean('is_correct').notNull().default(false),
	},
	(table) => [index('question_options_question_id_idx').on(table.questionId)],
)
