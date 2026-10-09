import { db } from '@app/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cancelAsaasSubscription } from '@/lib/billing/cancel-asaas-subscription'
import { createDbChain } from '@/test/create-db-chain'
import { reconcileSubscriptionStatus } from './reconcile-subscription-status'
import { sendBillingNotificationEmail } from './send-billing-notification-email'

vi.mock('@/lib/billing/cancel-asaas-subscription', () => ({
	cancelAsaasSubscription: vi.fn(),
}))

vi.mock('./send-billing-notification-email', () => ({
	sendBillingNotificationEmail: vi.fn().mockResolvedValue(undefined),
}))

describe('reconcileSubscriptionStatus', () => {
	beforeEach(() => {
		vi.mocked(sendBillingNotificationEmail).mockResolvedValue(undefined)
		vi.mocked(cancelAsaasSubscription).mockResolvedValue(undefined)
	})

	it('mantém ativa quando cancelAtPeriodEnd é true mas o período ainda não terminou', async () => {
		const subscription = {
			id: 'sub_1',
			userId: 'user_1',
			asaasSubscriptionId: 'sub_asaas_1',
			status: 'active' as const,
			cancelAtPeriodEnd: true,
			currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24),
			updatedAt: new Date(),
		}

		const result = await reconcileSubscriptionStatus(subscription)

		expect(result.status).toBe('active')
		expect(db.update).not.toHaveBeenCalled()
		expect(sendBillingNotificationEmail).not.toHaveBeenCalled()
	})

	it('cancela e notifica quando cancelAtPeriodEnd é true e o período já terminou', async () => {
		vi.mocked(db.update).mockReturnValue(createDbChain([]) as never)

		const subscription = {
			id: 'sub_2',
			userId: 'user_2',
			asaasSubscriptionId: 'sub_asaas_2',
			status: 'active' as const,
			cancelAtPeriodEnd: true,
			currentPeriodEnd: new Date(Date.now() - 1000),
			updatedAt: new Date(),
		}

		const result = await reconcileSubscriptionStatus(subscription)

		expect(result.status).toBe('canceled')
		expect(db.update).toHaveBeenCalled()
		expect(cancelAsaasSubscription).not.toHaveBeenCalled()
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'subscription_canceled',
			userId: 'user_2',
		})
	})

	it('cancela no Asaas e localmente quando past_due ultrapassou o prazo de tolerância', async () => {
		vi.mocked(db.update).mockReturnValue(createDbChain([]) as never)

		const subscription = {
			id: 'sub_3',
			userId: 'user_3',
			asaasSubscriptionId: 'sub_asaas_3',
			status: 'past_due' as const,
			cancelAtPeriodEnd: false,
			currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
			updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
		}

		const result = await reconcileSubscriptionStatus(subscription)

		expect(result.status).toBe('canceled')
		expect(cancelAsaasSubscription).toHaveBeenCalledWith('sub_asaas_3')
		expect(db.update).toHaveBeenCalled()
	})

	it('cancela localmente e loga quando o Asaas falha ao cancelar o past_due vencido', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.mocked(db.update).mockReturnValue(createDbChain([]) as never)
		vi.mocked(cancelAsaasSubscription).mockRejectedValue(
			new Error('Asaas indisponível'),
		)

		const subscription = {
			id: 'sub_5',
			userId: 'user_5',
			asaasSubscriptionId: 'sub_asaas_5',
			status: 'past_due' as const,
			cancelAtPeriodEnd: false,
			currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
			updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
		}

		const result = await reconcileSubscriptionStatus(subscription)

		expect(result.status).toBe('canceled')
		expect(db.update).toHaveBeenCalled()
		expect(consoleError).toHaveBeenCalledWith(
			'[billing] Falha ao cancelar assinatura no Asaas após inadimplência.',
			{ subscriptionId: 'sub_5' },
		)
	})

	it('mantém past_due dentro do prazo de tolerância', async () => {
		const subscription = {
			id: 'sub_4',
			userId: 'user_4',
			asaasSubscriptionId: 'sub_asaas_4',
			status: 'past_due' as const,
			cancelAtPeriodEnd: false,
			currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
			updatedAt: new Date(),
		}

		const result = await reconcileSubscriptionStatus(subscription)

		expect(result.status).toBe('past_due')
		expect(db.update).not.toHaveBeenCalled()
		expect(cancelAsaasSubscription).not.toHaveBeenCalled()
	})
})
