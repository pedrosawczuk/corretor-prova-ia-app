import { billingCustomersTable, db } from '@app/db'
import { faker } from '@faker-js/faker'
import { insertUser } from './insert-user'

type BillingCustomer = typeof billingCustomersTable.$inferSelect

export async function insertBillingCustomer(
	overrides: Partial<BillingCustomer> = {},
) {
	const userId = overrides.userId ?? (await insertUser()).id

	const [row] = await db
		.insert(billingCustomersTable)
		.values({
			asaasCustomerId: `cus_${faker.string.alphanumeric(12)}`,
			...overrides,
			userId,
		})
		.returning()

	return row
}
