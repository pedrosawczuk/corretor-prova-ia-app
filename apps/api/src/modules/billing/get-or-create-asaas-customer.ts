import { billingCustomersTable, db, eq } from '@app/db'
import { BadRequestError } from '@/core/errors'
import { createAsaasCustomer } from '@/lib/billing/create-asaas-customer'

interface BillingUser {
	id: string
	name: string
	email: string
}

interface GetOrCreateAsaasCustomerParams {
	user: BillingUser
	cpfCnpj: string | undefined
}

async function findAsaasCustomerId(userId: string) {
	const [billingCustomer] = await db
		.select({ asaasCustomerId: billingCustomersTable.asaasCustomerId })
		.from(billingCustomersTable)
		.where(eq(billingCustomersTable.userId, userId))

	return billingCustomer?.asaasCustomerId
}

export async function getOrCreateAsaasCustomer({
	user,
	cpfCnpj,
}: GetOrCreateAsaasCustomerParams): Promise<string> {
	const existingCustomerId = await findAsaasCustomerId(user.id)

	if (existingCustomerId) {
		return existingCustomerId
	}

	if (!cpfCnpj) {
		throw new BadRequestError('Informe seu CPF ou CNPJ para continuar.')
	}

	const customer = await createAsaasCustomer({
		name: user.name,
		email: user.email,
		cpfCnpj,
		externalReference: user.id,
	})

	await db
		.insert(billingCustomersTable)
		.values({ userId: user.id, asaasCustomerId: customer.id })
		.onConflictDoNothing({ target: billingCustomersTable.userId })

	const storedCustomerId = await findAsaasCustomerId(user.id)

	return storedCustomerId ?? customer.id
}
