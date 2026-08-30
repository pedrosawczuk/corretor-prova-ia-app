import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const subjectsTable = pgTable('subjects', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
