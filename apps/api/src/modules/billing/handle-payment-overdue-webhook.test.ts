import { describe, expect, it, vi } from 'vitest'
import { createDbChain } from '@/test/create-db-chain'
import { handlePaymentOverdueWebhook } from './handle-payment-overdue-webhook'

describe('handlePaymentOverdueWebhook', () => {
	it('ignora PAYMENT_OVERDUE quando o mesmo paymentId já foi pago', async () => {
		const tx = {
			select: vi
				.fn()
				.mockReturnValueOnce(
					createDbChain([
						{
							id: 'sub-1',
							userId: 'user-1',
							status: 'active',
							cancelAtPeriodEnd: false,
							currentPeriodStart: new Date('2026-11-01T00:00:00Z'),
						},
					]),
				)
				.mockReturnValueOnce(createDbChain([{ id: 'evt-paid-1' }])),
			update: vi.fn(),
		} as never

		const result = await handlePaymentOverdueWebhook(tx, {
			eventId: 'evt-overdue-1',
			paymentId: 'pay-1',
			asaasSubscriptionId: 'sub_asaas_1',
			paymentDueDate: '2026-11-10',
		})

		expect(result).toBeNull()
		expect(
			(tx as { update: ReturnType<typeof vi.fn> }).update,
		).not.toHaveBeenCalled()
	})

	it('ignora PAYMENT_OVERDUE de ciclo anterior quando currentPeriodStart é posterior ao dueDate', async () => {
		const tx = {
			select: vi
				.fn()
				.mockReturnValueOnce(
					createDbChain([
						{
							id: 'sub-1',
							userId: 'user-1',
							status: 'active',
							cancelAtPeriodEnd: false,
							currentPeriodStart: new Date('2026-11-15T12:00:00Z'),
						},
					]),
				)
				.mockReturnValueOnce(createDbChain([])),
			update: vi.fn(),
		} as never

		const result = await handlePaymentOverdueWebhook(tx, {
			eventId: 'evt-overdue-2',
			paymentId: 'pay-old',
			asaasSubscriptionId: 'sub_asaas_1',
			paymentDueDate: '2026-11-10',
		})

		expect(result).toBeNull()
		expect(
			(tx as { update: ReturnType<typeof vi.fn> }).update,
		).not.toHaveBeenCalled()
	})
})
