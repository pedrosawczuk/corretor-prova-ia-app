import { and, db, eq, plansTable, subscriptionsTable } from '@app/db'
import { env } from '@app/env'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
	BillingProviderError,
	ConflictError,
	NotFoundError,
} from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { createAbacatePayCustomer } from '@/lib/billing/create-abacatepay-customer'
import { createAbacatePayBilling } from '@/lib/billing/create-billing'
import type { CheckoutBody } from './checkout-schema'

export async function createCheckoutModule(
	request: FastifyRequest<{ Body: CheckoutBody }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { planSlug } = request.body

	const [plan] = await db
		.select()
		.from(plansTable)
		.where(and(eq(plansTable.slug, planSlug), eq(plansTable.isActive, true)))

	if (!plan) {
		throw new NotFoundError('Plano não encontrado.')
	}

	if (!plan.abacatepayProductId) {
		throw new BillingProviderError(
			'Este plano ainda não está disponível para compra. Tente novamente mais tarde.',
		)
	}

	if (plan.billingType === 'recurring') {
		const [activeSubscription] = await db
			.select()
			.from(subscriptionsTable)
			.where(
				and(
					eq(subscriptionsTable.userId, user.id),
					eq(subscriptionsTable.status, 'active'),
				),
			)

		if (activeSubscription) {
			throw new ConflictError(
				'Você já tem uma assinatura ativa. Para trocar de plano, use a troca de plano.',
			)
		}
	}

	const customer = await createAbacatePayCustomer({
		email: user.email,
		name: user.name,
	})

	const billing = await createAbacatePayBilling({
		billingType: plan.billingType,
		productId: plan.abacatepayProductId,
		customerId: customer.id,
		returnUrl: `${env.WEB_URL}/dashboard/configuracoes?checkout=cancelled`,
		completionUrl: `${env.WEB_URL}/dashboard/configuracoes?checkout=success`,
		metadata: { userId: user.id, planSlug: plan.slug },
	})

	return reply.status(200).send({ checkoutUrl: billing.url })
}
