import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const billingEventsTable = pgTable('billing_events', {
	id: uuid('id').primaryKey().defaultRandom(),
	abacatepayEventId: text('abacatepay_event_id').notNull().unique(),
	eventType: text('event_type').notNull(),
	payload: jsonb('payload').notNull(),
	processedAt: timestamp('processed_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})
