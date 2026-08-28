import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
} from 'drizzle-orm/pg-core'
import { user } from './users'

export const twoFactor = pgTable('two_factor', {
	id: text('id').primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	verified: boolean('verified').notNull().default(true),
	failedVerificationCount: integer('failed_verification_count'),
	lockedUntil: timestamp('locked_until'),
})
