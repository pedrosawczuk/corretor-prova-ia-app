import { eq, inArray, plansTable, subscriptionsTable } from '@app/db'
import type { AsaasExternalReference } from '@/lib/billing/asaas-external-reference'
import type { BillingTransaction } from './billing-transaction'
import type { BillingNotification } from './send-billing-notification-email'

interface HandleSubscriptionPaymentWebhookParams {
	eventId: string
	asaasSubscriptionId: string
	chargedAmountCents: number | undefined
	owner: AsaasExternalReference | null
}

type Subscription = typeof subscriptionsTable.$inferSelect

function addOneMonth(date: Date) {
	const next = new Date(date)
	next.setMonth(next.getMonth() + 1)
	return next
}

async function resolveRenewedPlan(
	tx: BillingTransaction,
	subscription: Subscription,
	chargedAmountCents: number | undefined,
	eventId: string,
) {
	if (!subscription.pendingPlanId) {
		return { planId: subscription.planId, pendingPlanId: null }
	}

	const plans = await tx
		.select()
		.from(plansTable)
		.where(
			inArray(plansTable.id, [subscription.planId, subscription.pendingPlanId]),
		)

	const currentPlan = plans.find(
		(candidate) => candidate.id === subscription.planId,
	)
	const pendingPlan = plans.find(
		(candidate) => candidate.id === subscription.pendingPlanId,
	)
	const isDowngradeOrLateral =
		currentPlan != null &&
		pendingPlan != null &&
		pendingPlan.priceCents <= currentPlan.priceCents
	const chargeMatchesPendingPlan =
		pendingPlan != null && chargedAmountCents === pendingPlan.priceCents

	if (pendingPlan && (isDowngradeOrLateral || chargeMatchesPendingPlan)) {
		return { planId: pendingPlan.id, pendingPlanId: null }
	}

	console.warn(
		'[billing webhook] Troca de plano pendente não promovida: valor cobrado não corresponde ao plano pendente.',
		{ eventId, subscriptionId: subscription.id },
	)

	return {
		planId: subscription.planId,
		pendingPlanId: subscription.pendingPlanId,
	}
}

export async function handleSubscriptionPaymentWebhook(
	tx: BillingTransaction,
	{
		eventId,
		asaasSubscriptionId,
		chargedAmountCents,
		owner,
	}: HandleSubscriptionPaymentWebhookParams,
): Promise<BillingNotification | null> {
	const currentPeriodStart = new Date()
	const currentPeriodEnd = addOneMonth(currentPeriodStart)

	const [existingSubscription] = await tx
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.asaasSubscriptionId, asaasSubscriptionId))

	if (existingSubscription) {
		if (existingSubscription.status === 'canceled') {
			console.warn(
				'[billing webhook] Pagamento recebido para assinatura já cancelada; ela não será reativada.',
				{ eventId, asaasSubscriptionId },
			)
			return null
		}

		const { planId, pendingPlanId } = await resolveRenewedPlan(
			tx,
			existingSubscription,
			chargedAmountCents,
			eventId,
		)

		await tx
			.update(subscriptionsTable)
			.set({
				status: 'active',
				currentPeriodStart,
				currentPeriodEnd,
				updatedAt: new Date(),
				planId,
				pendingPlanId,
			})
			.where(eq(subscriptionsTable.id, existingSubscription.id))

		return null
	}

	if (!owner) {
		console.error(
			'[billing webhook] Não foi possível identificar o dono da nova assinatura.',
			{ eventId, asaasSubscriptionId },
		)
		return null
	}

	const [plan] = await tx
		.select()
		.from(plansTable)
		.where(eq(plansTable.slug, owner.planSlug))

	if (!plan) {
		console.error(
			'[billing webhook] Nova assinatura referenciando plano inexistente.',
			{ eventId, asaasSubscriptionId, planSlug: owner.planSlug },
		)
		return null
	}

	await tx.insert(subscriptionsTable).values({
		userId: owner.userId,
		planId: plan.id,
		status: 'active',
		asaasSubscriptionId,
		currentPeriodStart,
		currentPeriodEnd,
	})

	return {
		type: 'payment_received',
		userId: owner.userId,
		planName: plan.name,
		priceCents: plan.priceCents,
	}
}
