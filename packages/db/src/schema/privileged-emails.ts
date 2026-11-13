import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './users'

export const privilegedEmailsTable = pgTable('privileged_emails', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	note: text('note'),
	createdByUserId: text('created_by_user_id').references(() => user.id, {
		onDelete: 'set null',
	}),
	claimedAt: timestamp('claimed_at'),
	revokedAt: timestamp('revoked_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})
