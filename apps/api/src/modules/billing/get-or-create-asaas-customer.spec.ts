import { billingCustomersTable, db, eq } from '@app/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BadRequestError } from '@/core/errors'
import { createAsaasCustomer } from '@/lib/billing/create-asaas-customer'
import { insertBillingCustomer } from '@/test/db-factories/insert-billing-customer'
import { insertUser } from '@/test/db-factories/insert-user'
import { getOrCreateAsaasCustomer } from './get-or-create-asaas-customer'

vi.mock('@/lib/billing/create-asaas-customer', () => ({
	createAsaasCustomer: vi.fn(),
}))

type User = Awaited<ReturnType<typeof insertUser>>

function selectBillingCustomers(userId: string) {
	return db
		.select()
		.from(billingCustomersTable)
		.where(eq(billingCustomersTable.userId, userId))
}

describe('getOrCreateAsaasCustomer (integração)', () => {
	let user: User

	beforeEach(async () => {
		user = await insertUser()
		vi.mocked(createAsaasCustomer).mockResolvedValue({ id: 'cus_novo' })
	})

	it('retorna o asaasCustomerId já gravado sem chamar o Asaas', async () => {
		await insertBillingCustomer({
			userId: user.id,
			asaasCustomerId: 'cus_existente',
		})

		const customerId = await getOrCreateAsaasCustomer({
			user,
			cpfCnpj: '52998224725',
		})

		expect(customerId).toBe('cus_existente')
		expect(createAsaasCustomer).not.toHaveBeenCalled()
		expect(await selectBillingCustomers(user.id)).toHaveLength(1)
	})

	it('lança BadRequestError quando não há cliente gravado e o CPF/CNPJ está ausente', async () => {
		await expect(
			getOrCreateAsaasCustomer({ user, cpfCnpj: undefined }),
		).rejects.toBeInstanceOf(BadRequestError)
		expect(createAsaasCustomer).not.toHaveBeenCalled()
		expect(await selectBillingCustomers(user.id)).toHaveLength(0)
	})

	it('cria o cliente no Asaas, grava a linha e retorna o id gravado no banco', async () => {
		const customerId = await getOrCreateAsaasCustomer({
			user,
			cpfCnpj: '52998224725',
		})

		expect(createAsaasCustomer).toHaveBeenCalledWith({
			name: user.name,
			email: user.email,
			cpfCnpj: '52998224725',
			externalReference: user.id,
		})
		expect(customerId).toBe('cus_novo')
		expect(await selectBillingCustomers(user.id)).toEqual([
			expect.objectContaining({ userId: user.id, asaasCustomerId: 'cus_novo' }),
		])
	})

	it('retorna o id que venceu a corrida quando outra requisição gravou o cliente antes do insert', async () => {
		vi.mocked(createAsaasCustomer).mockImplementation(async () => {
			await insertBillingCustomer({
				userId: user.id,
				asaasCustomerId: 'cus_vencedor',
			})
			return { id: 'cus_perdedor' }
		})

		const customerId = await getOrCreateAsaasCustomer({
			user,
			cpfCnpj: '52998224725',
		})

		expect(customerId).toBe('cus_vencedor')
		expect(await selectBillingCustomers(user.id)).toEqual([
			expect.objectContaining({ asaasCustomerId: 'cus_vencedor' }),
		])
	})
})
