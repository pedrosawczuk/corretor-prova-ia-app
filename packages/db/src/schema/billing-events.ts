import {
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'

export const billingEventsTable = pgTable(
	'billing_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		asaasEventId: text('asaas_event_id').notNull().unique(),
		asaasPaymentId: text('asaas_payment_id'),
		eventType: text('event_type').notNull(),
		payload: jsonb('payload').notNull(),
		processedAt: timestamp('processed_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [
		index('billing_events_asaas_payment_id_idx').on(table.asaasPaymentId),
	],
)
