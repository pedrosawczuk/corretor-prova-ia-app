import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './users'

export const correctionUsageLogsTable = pgTable(
	'correction_usage_logs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		submissionId: uuid('submission_id'),
		billingPeriodStart: timestamp('billing_period_start').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [
		index('correction_usage_logs_user_id_created_at_idx').on(
			table.userId,
			table.createdAt,
		),
	],
)
