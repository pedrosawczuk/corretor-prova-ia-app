import { abacatepayRequest } from './abacatepay-client'

interface CreateAbacatePayCustomerParams {
	email: string
	name: string
	taxId?: string
}

interface AbacatePayCustomer {
	id: string
}

export async function createAbacatePayCustomer(
	params: CreateAbacatePayCustomerParams,
): Promise<AbacatePayCustomer> {
	return abacatepayRequest<AbacatePayCustomer>('/customers/create', {
		method: 'POST',
		body: JSON.stringify({
			email: params.email,
			name: params.name,
			taxId: params.taxId,
		}),
	})
}
