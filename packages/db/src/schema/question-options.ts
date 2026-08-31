import {
	boolean,
	char,
	index,
	integer,
	numeric,
	pgTable,
	text,
	uuid,
} from 'drizzle-orm/pg-core'
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
		/**
		 * Posição do rótulo da alternativa (ex.: "A)") na página impressa
		 * travada da prova (exams.templateLockedAt) — extraída do PDF gerado
		 * via pdfjs-dist. Usada para localizar, na foto escaneada, onde
		 * verificar se o aluno marcou essa alternativa.
		 */
		markerPage: integer('marker_page'),
		markerX: numeric('marker_x', { precision: 8, scale: 2 }),
		markerY: numeric('marker_y', { precision: 8, scale: 2 }),
	},
	(table) => [index('question_options_question_id_idx').on(table.questionId)],
)
