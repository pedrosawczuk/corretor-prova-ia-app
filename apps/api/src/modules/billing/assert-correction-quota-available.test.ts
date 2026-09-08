import { describe, expect, it, vi } from 'vitest'
import { PaymentRequiredError } from '@/core/errors'
import { createDbChain } from '@/test/create-db-chain'
import { assertCorrectionQuotaAvailable } from './assert-correction-quota-available'

function makeTx(
	select: ReturnType<typeof vi.fn>,
	insert?: ReturnType<typeof vi.fn>,
) {
	return { select, insert } as never
}

describe('assertCorrectionQuotaAvailable', () => {
	it('bloqueia a linha do usuário antes de checar cota ou crédito', async () => {
		const select = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: 'user_1' }]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(createDbChain([{ creditBalance: 2 }]) as never)
		const insert = vi.fn().mockReturnValue(createDbChain([]) as never)
		const tx = makeTx(select, insert)

		await assertCorrectionQuotaAvailable(tx, 'user_1')

		const lockChain = select.mock.results[0].value
		expect(lockChain.for).toHaveBeenCalledWith('update')
	})

	it('permite quando ainda há saldo dentro da cota mensal da assinatura ativa', async () => {
		const select = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: 'user_1' }]) as never)
			.mockReturnValueOnce(
				createDbChain([
					{
						currentPeriodStart: new Date('2026-09-01'),
						currentPeriodEnd: new Date('2026-10-01'),
						monthlyCorrectionsLimit: 100,
					},
				]) as never,
			)
			.mockReturnValueOnce(createDbChain([{ correctionsUsed: 10 }]) as never)
		const insert = vi.fn()
		const tx = makeTx(select, insert)

		await expect(
			assertCorrectionQuotaAvailable(tx, 'user_1'),
		).resolves.toBeUndefined()
		expect(insert).not.toHaveBeenCalled()
	})

	it('cai para o crédito avulso e desconta 1 quando a cota mensal da assinatura já foi usada', async () => {
		const select = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: 'user_1' }]) as never)
			.mockReturnValueOnce(
				createDbChain([
					{
						currentPeriodStart: new Date('2026-09-01'),
						currentPeriodEnd: new Date('2026-10-01'),
						monthlyCorrectionsLimit: 100,
					},
				]) as never,
			)
			.mockReturnValueOnce(createDbChain([{ correctionsUsed: 100 }]) as never)
			.mockReturnValueOnce(createDbChain([{ creditBalance: 5 }]) as never)
		const insert = vi.fn().mockReturnValue(createDbChain([]) as never)
		const tx = makeTx(select, insert)

		await expect(
			assertCorrectionQuotaAvailable(tx, 'user_1'),
		).resolves.toBeUndefined()

		expect(insert).toHaveBeenCalledTimes(1)
		const insertChain = insert.mock.results[0].value
		expect(insertChain.values).toHaveBeenCalledWith({
			userId: 'user_1',
			delta: -1,
			source: 'consumption',
		})
	})

	it('permite via crédito avulso quando o usuário não tem assinatura ativa', async () => {
		const select = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: 'user_1' }]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(createDbChain([{ creditBalance: 2 }]) as never)
		const insert = vi.fn().mockReturnValue(createDbChain([]) as never)
		const tx = makeTx(select, insert)

		await expect(
			assertCorrectionQuotaAvailable(tx, 'user_1'),
		).resolves.toBeUndefined()
		expect(insert).toHaveBeenCalledTimes(1)
	})

	it('lança PaymentRequiredError quando não há assinatura ativa nem crédito', async () => {
		const select = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: 'user_1' }]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(createDbChain([{ creditBalance: 0 }]) as never)
		const insert = vi.fn()
		const tx = makeTx(select, insert)

		await expect(
			assertCorrectionQuotaAvailable(tx, 'user_1'),
		).rejects.toBeInstanceOf(PaymentRequiredError)
		expect(insert).not.toHaveBeenCalled()
	})

	it('serializa duas chamadas concorrentes no mesmo saldo: a segunda só vê o consumo da primeira porque compartilham a mesma transação/lock', async () => {
		const select = vi
			.fn()
			.mockReturnValueOnce(createDbChain([{ id: 'user_1' }]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(createDbChain([{ creditBalance: 1 }]) as never)
			.mockReturnValueOnce(createDbChain([{ id: 'user_1' }]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(createDbChain([{ creditBalance: 0 }]) as never)
		const insert = vi.fn().mockReturnValue(createDbChain([]) as never)
		const tx = makeTx(select, insert)

		await expect(
			assertCorrectionQuotaAvailable(tx, 'user_1'),
		).resolves.toBeUndefined()
		await expect(
			assertCorrectionQuotaAvailable(tx, 'user_1'),
		).rejects.toBeInstanceOf(PaymentRequiredError)

		expect(insert).toHaveBeenCalledTimes(1)
	})
})
