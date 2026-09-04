import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './users'

export const correctionCreditSourceEnum = pgEnum('correction_credit_source', [
	'purchase',
	'consumption',
	'manual_adjustment',
])

export const correctionCreditsTable = pgTable(
	'correction_credits',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		delta: integer('delta').notNull(),
		source: correctionCreditSourceEnum('source').notNull(),
		referenceId: text('reference_id'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [index('correction_credits_user_id_idx').on(table.userId)],
)
