import { db } from '@app/db'
import { describe, expect, it, vi } from 'vitest'
import { BadRequestError } from '@/core/errors'
import { createAsaasCustomer } from '@/lib/billing/create-asaas-customer'
import { createDbChain } from '@/test/create-db-chain'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { getOrCreateAsaasCustomer } from './get-or-create-asaas-customer'

vi.mock('@/lib/billing/create-asaas-customer', () => ({
	createAsaasCustomer: vi.fn(),
}))

describe('getOrCreateAsaasCustomer', () => {
	const user = makeAuthenticatedUser()

	it('retorna o asaasCustomerId já gravado sem chamar o Asaas', async () => {
		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ asaasCustomerId: 'cus_existente' }]) as never,
		)

		const customerId = await getOrCreateAsaasCustomer({
			user,
			cpfCnpj: '52998224725',
		})

		expect(customerId).toBe('cus_existente')
		expect(createAsaasCustomer).not.toHaveBeenCalled()
		expect(db.insert).not.toHaveBeenCalled()
	})

	it('lança BadRequestError quando não há cliente gravado e o CPF/CNPJ está ausente', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		await expect(
			getOrCreateAsaasCustomer({ user, cpfCnpj: undefined }),
		).rejects.toBeInstanceOf(BadRequestError)
		expect(createAsaasCustomer).not.toHaveBeenCalled()
	})

	it('cria o cliente no Asaas, grava a linha e retorna o id gravado no banco', async () => {
		const insertChain = createDbChain([])

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(
				createDbChain([{ asaasCustomerId: 'cus_vencedor' }]) as never,
			)
		vi.mocked(db.insert).mockReturnValue(insertChain as never)
		vi.mocked(createAsaasCustomer).mockResolvedValue({ id: 'cus_novo' })

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
		expect(insertChain.values).toHaveBeenCalledWith({
			userId: user.id,
			asaasCustomerId: 'cus_novo',
		})
		expect(insertChain.onConflictDoNothing).toHaveBeenCalled()
		expect(customerId).toBe('cus_vencedor')
	})
})
