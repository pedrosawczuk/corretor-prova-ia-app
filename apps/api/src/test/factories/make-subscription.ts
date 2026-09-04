import type { subscriptionsTable } from '@app/db'
import { faker } from '@faker-js/faker'

type Subscription = typeof subscriptionsTable.$inferSelect

export function makeSubscription(
	overrides: Partial<Subscription> = {},
): Subscription {
	const currentPeriodStart = faker.date.recent()

	return {
		id: faker.string.uuid(),
		userId: faker.string.uuid(),
		planId: faker.string.uuid(),
		pendingPlanId: null,
		status: 'active',
		abacatepayBillingId: `subs_${faker.string.alphanumeric(12)}`,
		currentPeriodStart,
		currentPeriodEnd: faker.date.future({ refDate: currentPeriodStart }),
		cancelAtPeriodEnd: false,
		createdAt: faker.date.recent(),
		updatedAt: faker.date.recent(),
		...overrides,
	}
}
