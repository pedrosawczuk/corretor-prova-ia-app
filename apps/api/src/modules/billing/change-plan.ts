import { and, db, eq, plansTable, subscriptionsTable } from '@app/db'
import { env } from '@app/env'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError, NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { buildAsaasExternalReference } from '@/lib/billing/asaas-external-reference'
import { cancelAsaasSubscription } from '@/lib/billing/cancel-asaas-subscription'
import { createAsaasSubscription } from '@/lib/billing/create-asaas-subscription'
import { getAsaasSubscriptionFirstPaymentUrl } from '@/lib/billing/get-asaas-subscription-first-payment-url'
import type { ChangePlanBody } from './change-plan-schema'
import { getOrCreateAsaasCustomer } from './get-or-create-asaas-customer'

export async function changePlanModule(
	request: FastifyRequest<{ Body: ChangePlanBody }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { planSlug, immediate } = request.body

	const [plan] = await db
		.select()
		.from(plansTable)
		.where(and(eq(plansTable.slug, planSlug), eq(plansTable.isActive, true)))

	if (plan?.billingType !== 'recurring') {
		throw new NotFoundError('Plano não encontrado.')
	}

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
		throw new NotFoundError(
			'Você não tem uma assinatura ativa. Assine um plano primeiro.',
		)
	}

	if (subscription.planId === plan.id && !subscription.pendingPlanId) {
		throw new ConflictError('Você já está nesse plano.')
	}

	if (!immediate) {
		const alreadyOnTargetPlan = subscription.planId === plan.id

		await db
			.update(subscriptionsTable)
			.set({
				pendingPlanId: alreadyOnTargetPlan ? null : plan.id,
				updatedAt: new Date(),
			})
			.where(eq(subscriptionsTable.id, subscription.id))

		return reply.status(200).send({
			pendingPlanSlug: alreadyOnTargetPlan ? null : plan.slug,
			effectiveAt: subscription.currentPeriodEnd,
		})
	}

	await cancelAsaasSubscription(subscription.asaasSubscriptionId)

	await db
		.update(subscriptionsTable)
		.set({
			status: 'canceled',
			cancelAtPeriodEnd: false,
			pendingPlanId: null,
			updatedAt: new Date(),
		})
		.where(eq(subscriptionsTable.id, subscription.id))

	const customerId = await getOrCreateAsaasCustomer({
		user,
		cpfCnpj: undefined,
	})

	const newSubscription = await createAsaasSubscription({
		customerId,
		valueCents: plan.priceCents,
		description: `Plano ${plan.name}`,
		externalReference: buildAsaasExternalReference({
			userId: user.id,
			planSlug: plan.slug,
		}),
		successUrl: `${env.WEB_URL}/dashboard/configuracoes?checkout=success`,
	})
	const checkoutUrl = await getAsaasSubscriptionFirstPaymentUrl(
		newSubscription.id,
	)

	return reply.status(200).send({ checkoutUrl })
}
