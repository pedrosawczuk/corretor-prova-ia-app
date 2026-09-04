import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'

export const planBillingTypeEnum = pgEnum('plan_billing_type', [
	'one_time',
	'recurring',
])

export const plansTable = pgTable('plans', {
	id: uuid('id').primaryKey().defaultRandom(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	billingType: planBillingTypeEnum('billing_type').notNull(),
	priceCents: integer('price_cents').notNull(),
	abacatepayProductId: text('abacatepay_product_id'),
	monthlyCorrectionsLimit: integer('monthly_corrections_limit'),
	creditsGranted: integer('credits_granted'),
	allowsDocxExport: boolean('allows_docx_export').notNull().default(false),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
