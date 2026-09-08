import { and, db, eq, subscriptionsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { cancelAbacatePaySubscription } from '@/lib/billing/cancel-abacatepay-billing'

export async function cancelSubscriptionModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)

	const [subscription] = await db
		.select()
		.from(subscriptionsTable)
		.where(
			and(
				eq(subscriptionsTable.userId, user.id),
				eq(subscriptionsTable.status, 'active'),
			),
		)

	if (!subscription) {
		throw new NotFoundError('Você não tem uma assinatura ativa para cancelar.')
	}

	if (subscription.cancelAtPeriodEnd) {
		return reply.status(200).send({
			cancelAtPeriodEnd: true,
			currentPeriodEnd: subscription.currentPeriodEnd,
		})
	}

	await cancelAbacatePaySubscription(subscription.abacatepayBillingId)

	await db
		.update(subscriptionsTable)
		.set({
			cancelAtPeriodEnd: true,
			pendingPlanId: null,
			updatedAt: new Date(),
		})
		.where(eq(subscriptionsTable.id, subscription.id))

	return reply.status(200).send({
		cancelAtPeriodEnd: true,
		currentPeriodEnd: subscription.currentPeriodEnd,
	})
}
