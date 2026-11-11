import { sql } from 'drizzle-orm'
import {
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core'
import { user } from './users'

export const invitesTable = pgTable(
	'invites',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		email: text('email').notNull(),
		tokenHash: text('token_hash').notNull().unique(),
		invitedByUserId: text('invited_by_user_id').references(() => user.id, {
			onDelete: 'set null',
		}),
		expiresAt: timestamp('expires_at').notNull(),
		acceptedAt: timestamp('accepted_at'),
		revokedAt: timestamp('revoked_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [
		index('invites_email_idx').on(table.email),
		uniqueIndex('invites_open_per_email_idx')
			.on(table.email)
			.where(sql`${table.acceptedAt} is null and ${table.revokedAt} is null`),
	],
)
