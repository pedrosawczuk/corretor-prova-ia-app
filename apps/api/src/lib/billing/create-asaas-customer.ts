import { asaasRequest } from './asaas-client'

interface CreateAsaasCustomerParams {
	name: string
	email: string
	cpfCnpj: string
	externalReference: string
}

interface AsaasCustomer {
	id: string
}

export async function createAsaasCustomer(
	params: CreateAsaasCustomerParams,
): Promise<AsaasCustomer> {
	return asaasRequest<AsaasCustomer>('/customers', {
		method: 'POST',
		body: JSON.stringify({
			name: params.name,
			email: params.email,
			cpfCnpj: params.cpfCnpj,
			externalReference: params.externalReference,
		}),
	})
}
