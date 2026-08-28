import {
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import { examsTable } from './exams'

export const submissionStatusEnum = pgEnum('submission_status', [
	'pending_processing',
	'processing',
	'needs_review',
	'completed',
	'failed',
])

export const submissionsTable = pgTable(
	'submissions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		examId: uuid('exam_id')
			.notNull()
			.references(() => examsTable.id, { onDelete: 'cascade' }),
		studentIdentifier: text('student_identifier'),
		totalScore: numeric('total_score', { precision: 5, scale: 2 }),
		status: submissionStatusEnum('status')
			.notNull()
			.default('pending_processing'),
		correctedAt: timestamp('corrected_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [index('submissions_exam_id_idx').on(table.examId)],
)
