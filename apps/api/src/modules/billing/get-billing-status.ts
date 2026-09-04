import {
	and,
	correctionCreditsTable,
	db,
	desc,
	eq,
	examsTable,
	gte,
	inArray,
	lte,
	plansTable,
	sql,
	submissionsTable,
	subscriptionsTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'

export async function getBillingStatusModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)

	const [subscription] = await db
		.select({
			status: subscriptionsTable.status,
			currentPeriodStart: subscriptionsTable.currentPeriodStart,
			currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
			cancelAtPeriodEnd: subscriptionsTable.cancelAtPeriodEnd,
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

	const [{ correctionsUsed }] = subscription
		? await db
				.select({ correctionsUsed: sql<number>`count(*)::int` })
				.from(submissionsTable)
				.innerJoin(examsTable, eq(submissionsTable.examId, examsTable.id))
				.where(
					and(
						eq(examsTable.creatorId, user.id),
						gte(submissionsTable.createdAt, subscription.currentPeriodStart),
						lte(submissionsTable.createdAt, subscription.currentPeriodEnd),
					),
				)
		: [{ correctionsUsed: 0 }]

	const [{ creditBalance }] = await db
		.select({
			creditBalance: sql<number>`coalesce(sum(${correctionCreditsTable.delta}), 0)::int`,
		})
		.from(correctionCreditsTable)
		.where(eq(correctionCreditsTable.userId, user.id))

	return reply.status(200).send({
		plan: subscription
			? {
					slug: subscription.planSlug,
					name: subscription.planName,
					monthlyCorrectionsLimit: subscription.monthlyCorrectionsLimit,
					allowsDocxExport: subscription.allowsDocxExport,
				}
			: null,
		subscriptionStatus: subscription?.status ?? null,
		currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
		cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
		correctionsUsed,
		creditBalance,
	})
}
