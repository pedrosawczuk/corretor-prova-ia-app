import { and, db, eq, plansTable, subscriptionsTable } from '@app/db'
import { env } from '@app/env'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError, NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { buildAsaasExternalReference } from '@/lib/billing/asaas-external-reference'
import { createAsaasPayment } from '@/lib/billing/create-asaas-payment'
import { createAsaasSubscription } from '@/lib/billing/create-asaas-subscription'
import { getAsaasSubscriptionFirstPaymentUrl } from '@/lib/billing/get-asaas-subscription-first-payment-url'
import type { CheckoutBody } from './checkout-schema'
import { getOrCreateAsaasCustomer } from './get-or-create-asaas-customer'

export async function createCheckoutModule(
	request: FastifyRequest<{ Body: CheckoutBody }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { planSlug, cpfCnpj } = request.body

	const [plan] = await db
		.select()
		.from(plansTable)
		.where(and(eq(plansTable.slug, planSlug), eq(plansTable.isActive, true)))

	if (!plan) {
		throw new NotFoundError('Plano não encontrado.')
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

	const customerId = await getOrCreateAsaasCustomer({ user, cpfCnpj })
	const externalReference = buildAsaasExternalReference({
		userId: user.id,
		planSlug: plan.slug,
	})
	const successUrl = `${env.WEB_URL}/dashboard/configuracoes?checkout=success`

	if (plan.billingType === 'one_time') {
		const payment = await createAsaasPayment({
			customerId,
			valueCents: plan.priceCents,
			description: `${plan.name} - ${plan.creditsGranted} correções`,
			externalReference,
			successUrl,
		})

		return reply.status(200).send({ checkoutUrl: payment.invoiceUrl })
	}

	const subscription = await createAsaasSubscription({
		customerId,
		valueCents: plan.priceCents,
		description: `Plano ${plan.name}`,
		externalReference,
		successUrl,
	})
	const checkoutUrl = await getAsaasSubscriptionFirstPaymentUrl(subscription.id)

	return reply.status(200).send({ checkoutUrl })
}
