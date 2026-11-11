import {
	pgEnum,
	pgTable,
	primaryKey,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import { accessGrantsTable } from './access-grants'

export const accessGrantReminderKindEnum = pgEnum(
	'access_grant_reminder_kind',
	['30_days', '7_days', '1_day'],
)

export const accessGrantRemindersTable = pgTable(
	'access_grant_reminders',
	{
		grantId: uuid('grant_id')
			.notNull()
			.references(() => accessGrantsTable.id, { onDelete: 'cascade' }),
		kind: accessGrantReminderKindEnum('kind').notNull(),
		sentAt: timestamp('sent_at').notNull().defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.grantId, table.kind] })],
)
