import {
	billingEventsTable,
	correctionCreditsTable,
	db,
	eq,
	plansTable,
	subscriptionsTable,
} from '@app/db'
import { env } from '@app/env'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyAbacatePayWebhookSignature } from '@/lib/billing/verify-webhook-signature'
import { billingWebhookPayloadSchema } from './billing-webhook-schema'

function addOneMonth(date: Date) {
	const next = new Date(date)
	next.setMonth(next.getMonth() + 1)
	return next
}

function extractStringField(data: Record<string, unknown>, field: string) {
	const value = data[field]
	return typeof value === 'string' ? value : undefined
}

function extractMetadataField(data: Record<string, unknown>, field: string) {
	const metadata = data.metadata
	if (!metadata || typeof metadata !== 'object') return undefined
	const value = (metadata as Record<string, unknown>)[field]
	return typeof value === 'string' ? value : undefined
}

export async function billingWebhookModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const rawBody = (request.body as Buffer).toString('utf8')
	const signatureHeader = request.headers['x-webhook-signature']
	const signature = Array.isArray(signatureHeader)
		? signatureHeader[0]
		: signatureHeader

	if (
		!verifyAbacatePayWebhookSignature(
			rawBody,
			signature,
			env.ABACATEPAY_WEBHOOK_SECRET,
		)
	) {
		console.error('[billing webhook] Assinatura inválida recebida.')
		return reply.status(401).send({
			code: 'INVALID_WEBHOOK_SIGNATURE',
			message: 'Assinatura do webhook inválida.',
		})
	}

	let json: unknown
	try {
		json = JSON.parse(rawBody)
	} catch {
		console.error('[billing webhook] Corpo do webhook não é um JSON válido.')
		return reply.status(200).send({ received: true })
	}

	const parsed = billingWebhookPayloadSchema.safeParse(json)

	if (!parsed.success) {
		console.error(
			'[billing webhook] Payload fora do formato esperado.',
			parsed.error.issues,
		)
		return reply.status(200).send({ received: true })
	}

	const payload = parsed.data

	await db.transaction(async (tx) => {
		const [inserted] = await tx
			.insert(billingEventsTable)
			.values({
				abacatepayEventId: payload.id,
				eventType: payload.event,
				payload: json,
			})
			.onConflictDoNothing({ target: billingEventsTable.abacatepayEventId })
			.returning()

		if (!inserted) return

		switch (payload.event) {
			case 'checkout.completed': {
				const userId = extractMetadataField(payload.data, 'userId')
				const planSlug = extractMetadataField(payload.data, 'planSlug')

				if (!userId || !planSlug) {
					console.error(
						'[billing webhook] checkout.completed sem metadata.userId/planSlug.',
						{ eventId: payload.id },
					)
					break
				}

				const [plan] = await tx
					.select()
					.from(plansTable)
					.where(eq(plansTable.slug, planSlug))

				if (!plan || plan.creditsGranted == null) {
					console.error(
						'[billing webhook] checkout.completed referenciando plano sem créditos avulsos.',
						{ eventId: payload.id, planSlug },
					)
					break
				}

				await tx.insert(correctionCreditsTable).values({
					userId,
					delta: plan.creditsGranted,
					source: 'purchase',
					referenceId: extractStringField(payload.data, 'id') ?? payload.id,
				})
				break
			}

			case 'subscription.completed':
			case 'subscription.renewed': {
				const abacatepayBillingId = extractStringField(payload.data, 'id')

				if (!abacatepayBillingId) {
					console.error('[billing webhook] Evento de assinatura sem data.id.', {
						eventId: payload.id,
						event: payload.event,
					})
					break
				}

				const currentPeriodStart = new Date()
				const currentPeriodEnd = addOneMonth(currentPeriodStart)

				const [existingSubscription] = await tx
					.select()
					.from(subscriptionsTable)
					.where(
						eq(subscriptionsTable.abacatepayBillingId, abacatepayBillingId),
					)

				if (existingSubscription) {
					await tx
						.update(subscriptionsTable)
						.set({
							status: 'active',
							currentPeriodStart,
							currentPeriodEnd,
							updatedAt: new Date(),
						})
						.where(eq(subscriptionsTable.id, existingSubscription.id))
					break
				}

				const userId = extractMetadataField(payload.data, 'userId')
				const planSlug = extractMetadataField(payload.data, 'planSlug')

				if (!userId || !planSlug) {
					console.error(
						'[billing webhook] Nova assinatura sem metadata.userId/planSlug.',
						{ eventId: payload.id },
					)
					break
				}

				const [plan] = await tx
					.select()
					.from(plansTable)
					.where(eq(plansTable.slug, planSlug))

				if (!plan) {
					console.error(
						'[billing webhook] Nova assinatura referenciando plano inexistente.',
						{ eventId: payload.id, planSlug },
					)
					break
				}

				await tx.insert(subscriptionsTable).values({
					userId,
					planId: plan.id,
					status: 'active',
					abacatepayBillingId,
					currentPeriodStart,
					currentPeriodEnd,
				})
				break
			}

			default:
				console.warn(
					'[billing webhook] Evento recebido sem tratamento mapeado.',
					{ eventId: payload.id, event: payload.event },
				)
		}

		await tx
			.update(billingEventsTable)
			.set({ processedAt: new Date() })
			.where(eq(billingEventsTable.id, inserted.id))
	})

	return reply.status(200).send({ received: true })
}
