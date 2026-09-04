import { sql } from 'drizzle-orm'
import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core'
import { plansTable } from './plans'
import { user } from './users'

export const subscriptionStatusEnum = pgEnum('subscription_status', [
	'active',
	'past_due',
	'canceled',
])

export const subscriptionsTable = pgTable(
	'subscriptions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		planId: uuid('plan_id')
			.notNull()
			.references(() => plansTable.id),
		pendingPlanId: uuid('pending_plan_id').references(() => plansTable.id),
		status: subscriptionStatusEnum('status').notNull(),
		abacatepayBillingId: text('abacatepay_billing_id').notNull(),
		currentPeriodStart: timestamp('current_period_start').notNull(),
		currentPeriodEnd: timestamp('current_period_end').notNull(),
		cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [
		index('subscriptions_user_id_idx').on(table.userId),
		index('subscriptions_abacatepay_billing_id_idx').on(
			table.abacatepayBillingId,
		),
		uniqueIndex('subscriptions_active_per_user_idx')
			.on(table.userId)
			.where(sql`${table.status} = 'active'`),
	],
)
