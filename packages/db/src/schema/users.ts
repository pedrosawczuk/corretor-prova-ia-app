import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
