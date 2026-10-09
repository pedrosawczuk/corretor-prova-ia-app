import { correctionCreditsTable, eq, plansTable } from '@app/db'
import { parseAsaasExternalReference } from '@/lib/billing/asaas-external-reference'
import type { BillingTransaction } from './billing-transaction'
import type { BillingNotification } from './send-billing-notification-email'

interface HandleOneTimePaymentWebhookParams {
	eventId: string
	paymentId: string | undefined
	externalReference: string | undefined
}

export async function handleOneTimePaymentWebhook(
	tx: BillingTransaction,
	{ eventId, paymentId, externalReference }: HandleOneTimePaymentWebhookParams,
): Promise<BillingNotification | null> {
	const owner = parseAsaasExternalReference(externalReference)

	if (!owner || !paymentId) {
		console.error(
			'[billing webhook] Pagamento avulso sem payment.id ou externalReference válido.',
			{ eventId, paymentId },
		)
		return null
	}

	const [plan] = await tx
		.select()
		.from(plansTable)
		.where(eq(plansTable.slug, owner.planSlug))

	if (!plan || plan.creditsGranted == null) {
		console.error(
			'[billing webhook] Pagamento avulso referenciando plano sem créditos avulsos.',
			{ eventId, paymentId, planSlug: owner.planSlug },
		)
		return null
	}

	await tx.insert(correctionCreditsTable).values({
		userId: owner.userId,
		delta: plan.creditsGranted,
		source: 'purchase',
		referenceId: paymentId,
	})

	return {
		type: 'payment_received',
		userId: owner.userId,
		planName: plan.name,
		priceCents: plan.priceCents,
	}
}
