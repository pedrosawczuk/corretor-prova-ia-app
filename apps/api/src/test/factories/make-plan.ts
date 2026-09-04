import type { plansTable } from '@app/db'
import { faker } from '@faker-js/faker'

type Plan = typeof plansTable.$inferSelect

export function makePlan(overrides: Partial<Plan> = {}): Plan {
	return {
		id: faker.string.uuid(),
		slug: 'essencial',
		name: 'Essencial',
		billingType: 'recurring',
		priceCents: 3990,
		abacatepayProductId: `prod_${faker.string.alphanumeric(12)}`,
		monthlyCorrectionsLimit: 100,
		creditsGranted: null,
		allowsDocxExport: false,
		isActive: true,
		createdAt: faker.date.recent(),
		updatedAt: faker.date.recent(),
		...overrides,
	}
}
