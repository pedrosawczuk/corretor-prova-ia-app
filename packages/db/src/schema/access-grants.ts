import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import { invitesTable } from './invites'
import { plansTable } from './plans'
import { user } from './users'

export const accessGrantSourceEnum = pgEnum('access_grant_source', [
	'invite',
	'privileged_email',
])

export const accessGrantsTable = pgTable(
	'access_grants',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: 'cascade' }),
		planId: uuid('plan_id')
			.notNull()
			.references(() => plansTable.id),
		source: accessGrantSourceEnum('source').notNull(),
		inviteId: uuid('invite_id').references(() => invitesTable.id, {
			onDelete: 'set null',
		}),
		startsAt: timestamp('starts_at').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		revokedAt: timestamp('revoked_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [index('access_grants_expires_at_idx').on(table.expiresAt)],
)
