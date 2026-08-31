import {
	boolean,
	index,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import { questionOptionsTable } from './question-options'
import { questionsTable } from './questions'
import { submissionsTable } from './submissions'
import { user } from './users'

export const submissionAnswersTable = pgTable(
	'submission_answers',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		submissionId: uuid('submission_id')
			.notNull()
			.references(() => submissionsTable.id, { onDelete: 'cascade' }),
		questionId: uuid('question_id')
			.notNull()
			.references(() => questionsTable.id, { onDelete: 'cascade' }),
		markedOptionId: uuid('marked_option_id').references(
			() => questionOptionsTable.id,
			{ onDelete: 'set null' },
		),
		extractedText: text('extracted_text'),
		aiScore: numeric('ai_score', { precision: 5, scale: 2 }),
		finalScore: numeric('final_score', { precision: 5, scale: 2 }),
		aiFeedback: text('ai_feedback'),
		confidence: numeric('confidence', { precision: 3, scale: 2 }),
		requiresReview: boolean('requires_review').notNull().default(false),
		reviewedBy: text('reviewed_by').references(() => user.id, {
			onDelete: 'set null',
		}),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [
		index('submission_answers_submission_id_idx').on(table.submissionId),
		index('submission_answers_question_id_idx').on(table.questionId),
	],
)
