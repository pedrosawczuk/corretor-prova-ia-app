import {
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import { classroomsTable } from './classrooms'
import { user } from './users'

export const examStatusEnum = pgEnum('exam_status', ['draft', 'finalized'])

export const examsTable = pgTable(
	'exams',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		title: text('title').notNull(),
		description: text('description'),
		totalPoints: numeric('total_points', { precision: 5, scale: 2 }).notNull(),
		status: examStatusEnum('status').notNull().default('draft'),
		classroomId: uuid('classroom_id')
			.notNull()
			.references(() => classroomsTable.id, { onDelete: 'cascade' }),
		creatorId: text('creator_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		templatePdfUrl: text('template_pdf_url'),
		/**
		 * Página impressa "trava" (bytes + coordenadas dos marcadores de
		 * alternativa em question_options) sempre que a prova é exportada.
		 * Correção por foto só é permitida contra essa versão travada — se a
		 * prova for editada depois, `templateLockedAt` fica desatualizado em
		 * relação a `updatedAt` e o template é regerado no próximo export.
		 */
		templatePageCount: integer('template_page_count'),
		templateLockedAt: timestamp('template_locked_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [
		index('exams_classroom_id_idx').on(table.classroomId),
		index('exams_creator_id_idx').on(table.creatorId),
	],
)
