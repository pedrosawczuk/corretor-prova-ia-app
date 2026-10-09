import { db, subscriptionsTable } from '@app/db'
import { makeSubscription } from '@/test/factories/make-subscription'
import { insertPlan } from './insert-plan'
import { insertUser } from './insert-user'

type Subscription = typeof subscriptionsTable.$inferSelect

export async function insertSubscription(
	overrides: Partial<Subscription> = {},
) {
	const userId = overrides.userId ?? (await insertUser()).id
	const planId = overrides.planId ?? (await insertPlan()).id

	const [row] = await db
		.insert(subscriptionsTable)
		.values(makeSubscription({ ...overrides, userId, planId }))
		.returning()

	return row
}
