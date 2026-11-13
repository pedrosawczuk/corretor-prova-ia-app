import {
	and,
	billingCustomersTable,
	correctionCreditsTable,
	correctionUsageLogsTable,
	db,
	desc,
	eq,
	gte,
	inArray,
	lte,
	plansTable,
	sql,
	subscriptionsTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { claimAccessGrant } from '@/modules/access-grants/claim-access-grant'
import { findActiveAccessGrant } from '@/modules/access-grants/find-active-access-grant'
import { resolveAccessGrantUsagePeriod } from '@/modules/access-grants/resolve-access-grant-usage-period'
import { reconcileSubscriptionStatus } from './reconcile-subscription-status'

export async function getBillingStatusModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)

	await claimAccessGrant(user.id).catch((error) => {
		console.error('[access grants] Falha ao aplicar cortesia pendente.', {
			userId: user.id,
			error,
		})
	})

	const [subscriptionRow] = await db
		.select({
			id: subscriptionsTable.id,
			userId: subscriptionsTable.userId,
			asaasSubscriptionId: subscriptionsTable.asaasSubscriptionId,
			status: subscriptionsTable.status,
			currentPeriodStart: subscriptionsTable.currentPeriodStart,
			currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
			cancelAtPeriodEnd: subscriptionsTable.cancelAtPeriodEnd,
			createdAt: subscriptionsTable.createdAt,
			updatedAt: subscriptionsTable.updatedAt,
			planSlug: plansTable.slug,
			planName: plansTable.name,
			monthlyCorrectionsLimit: plansTable.monthlyCorrectionsLimit,
			allowsDocxExport: plansTable.allowsDocxExport,
		})
		.from(subscriptionsTable)
		.innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
		.where(
			and(
				eq(subscriptionsTable.userId, user.id),
				inArray(subscriptionsTable.status, ['active', 'past_due']),
			),
		)
		.orderBy(desc(subscriptionsTable.createdAt))
		.limit(1)

	const reconciled = subscriptionRow
		? await reconcileSubscriptionStatus(subscriptionRow)
		: undefined
	const subscription =
		reconciled?.status === 'canceled' ? undefined : reconciled

	const accessGrant = await findActiveAccessGrant(db, user.id)
	const accessGrantPeriod = accessGrant
		? resolveAccessGrantUsagePeriod(accessGrant)
		: undefined
	const usagePeriod = subscription
		? {
				start: subscription.currentPeriodStart,
				end: subscription.currentPeriodEnd,
			}
		: accessGrantPeriod
	const effectivePlan = subscription ?? accessGrant

	const [{ correctionsUsed }] = usagePeriod
		? await db
				.select({ correctionsUsed: sql<number>`count(*)::int` })
				.from(correctionUsageLogsTable)
				.where(
					and(
						eq(correctionUsageLogsTable.userId, user.id),
						gte(correctionUsageLogsTable.createdAt, usagePeriod.start),
						lte(correctionUsageLogsTable.createdAt, usagePeriod.end),
					),
				)
		: [{ correctionsUsed: 0 }]

	const [{ creditBalance }] = await db
		.select({
			creditBalance: sql<number>`coalesce(sum(${correctionCreditsTable.delta}), 0)::int`,
		})
		.from(correctionCreditsTable)
		.where(eq(correctionCreditsTable.userId, user.id))

	const [billingCustomer] = await db
		.select({ userId: billingCustomersTable.userId })
		.from(billingCustomersTable)
		.where(eq(billingCustomersTable.userId, user.id))

	return reply.status(200).send({
		plan: effectivePlan
			? {
					slug: effectivePlan.planSlug,
					name: effectivePlan.planName,
					monthlyCorrectionsLimit: effectivePlan.monthlyCorrectionsLimit,
					allowsDocxExport: effectivePlan.allowsDocxExport,
				}
			: null,
		subscriptionStatus: subscription?.status ?? null,
		currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
		cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
		subscriberSince: subscription?.createdAt ?? null,
		correctionsUsed,
		creditBalance,
		hasBillingCustomer: Boolean(billingCustomer),
		accessGrant: accessGrant
			? { source: accessGrant.source, expiresAt: accessGrant.expiresAt }
			: null,
	})
}
