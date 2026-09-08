import { db } from '@app/db'
import type { FastifyInstance } from 'fastify'
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { BillingProviderError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { cancelAbacatePaySubscription } from '@/lib/billing/cancel-abacatepay-billing'
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeSubscription } from '@/test/factories/make-subscription'

vi.mock('@/lib/billing/cancel-abacatepay-billing', () => ({
	cancelAbacatePaySubscription: vi.fn(),
}))

describe('POST /billing/cancel', () => {
	let app: FastifyInstance
	const user = makeAuthenticatedUser()

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		vi.mocked(getAuthenticatedUser).mockResolvedValue(user as never)
	})

	it('cancela na AbacatePay e agenda o fim de acesso para o fim do ciclo pago', async () => {
		const subscription = makeSubscription({
			userId: user.id,
			cancelAtPeriodEnd: false,
		})

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([subscription]) as never,
		)
		vi.mocked(db.update).mockReturnValue(createDbChain([]) as never)
		vi.mocked(cancelAbacatePaySubscription).mockResolvedValue(undefined)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/cancel',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			cancelAtPeriodEnd: true,
			currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
		})
		expect(cancelAbacatePaySubscription).toHaveBeenCalledWith(
			subscription.abacatepayBillingId,
		)
		expect(db.update).toHaveBeenCalled()
	})

	it('é idempotente quando o cancelamento já havia sido solicitado antes', async () => {
		const subscription = makeSubscription({
			userId: user.id,
			cancelAtPeriodEnd: true,
		})

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([subscription]) as never,
		)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/cancel',
		})

		expect(response.statusCode).toBe(200)
		expect(cancelAbacatePaySubscription).not.toHaveBeenCalled()
		expect(db.update).not.toHaveBeenCalled()
	})

	it('retorna 404 quando não há assinatura ativa', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/cancel',
		})

		expect(response.statusCode).toBe(404)
	})

	it('não marca cancelamento local quando a chamada à AbacatePay falha', async () => {
		const subscription = makeSubscription({
			userId: user.id,
			cancelAtPeriodEnd: false,
		})

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([subscription]) as never,
		)
		vi.mocked(cancelAbacatePaySubscription).mockRejectedValue(
			new BillingProviderError('Provedor indisponível.'),
		)

		const response = await app.inject({
			method: 'POST',
			url: '/billing/cancel',
		})

		expect(response.statusCode).toBe(502)
		expect(db.update).not.toHaveBeenCalled()
	})
})
