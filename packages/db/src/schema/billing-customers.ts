import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './users'

export const billingCustomersTable = pgTable('billing_customers', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	asaasCustomerId: text('asaas_customer_id').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})
