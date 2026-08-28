import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import { submissionsTable } from './submissions'

export const submissionPagesTable = pgTable(
	'submission_pages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		submissionId: uuid('submission_id')
			.notNull()
			.references(() => submissionsTable.id, { onDelete: 'cascade' }),
		pageNumber: integer('page_number').notNull(),
		imageUrl: text('image_url').notNull(),
		rawOcrPayload: jsonb('raw_ocr_payload'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [
		index('submission_pages_submission_id_idx').on(table.submissionId),
	],
)
