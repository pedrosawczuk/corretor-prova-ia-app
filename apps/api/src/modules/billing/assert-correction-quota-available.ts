import {
	and,
	correctionCreditsTable,
	type db,
	eq,
	examsTable,
	gte,
	lte,
	plansTable,
	sql,
	submissionsTable,
	subscriptionsTable,
	user,
} from '@app/db'
import { PaymentRequiredError } from '@/core/errors'
import { findActiveAccessGrant } from '@/modules/access-grants/find-active-access-grant'
import { resolveAccessGrantUsagePeriod } from '@/modules/access-grants/resolve-access-grant-usage-period'

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function resolveAccessGrantAllowance(tx: Transaction, userId: string) {
	const accessGrant = await findActiveAccessGrant(tx, userId)

	if (!accessGrant) {
		return undefined
	}

	const period = resolveAccessGrantUsagePeriod(accessGrant)

	return {
		currentPeriodStart: period.start,
		currentPeriodEnd: period.end,
		monthlyCorrectionsLimit: accessGrant.monthlyCorrectionsLimit,
	}
}

export async function assertCorrectionQuotaAvailable(
	tx: Transaction,
	userId: string,
): Promise<void> {
	await tx
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, userId))
		.for('update')

	const [subscription] = await tx
		.select({
			currentPeriodStart: subscriptionsTable.currentPeriodStart,
			currentPeriodEnd: subscriptionsTable.currentPeriodEnd,
			monthlyCorrectionsLimit: plansTable.monthlyCorrectionsLimit,
		})
		.from(subscriptionsTable)
		.innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
		.where(
			and(
				eq(subscriptionsTable.userId, userId),
				eq(subscriptionsTable.status, 'active'),
			),
		)

	const allowance =
		subscription ?? (await resolveAccessGrantAllowance(tx, userId))

	if (allowance) {
		if (allowance.monthlyCorrectionsLimit == null) {
			return
		}

		const [{ correctionsUsed }] = await tx
			.select({ correctionsUsed: sql<number>`count(*)::int` })
			.from(submissionsTable)
			.innerJoin(examsTable, eq(submissionsTable.examId, examsTable.id))
			.where(
				and(
					eq(examsTable.creatorId, userId),
					gte(submissionsTable.createdAt, allowance.currentPeriodStart),
					lte(submissionsTable.createdAt, allowance.currentPeriodEnd),
				),
			)

		if (correctionsUsed < allowance.monthlyCorrectionsLimit) {
			return
		}
	}

	const [{ creditBalance }] = await tx
		.select({
			creditBalance: sql<number>`coalesce(sum(${correctionCreditsTable.delta}), 0)::int`,
		})
		.from(correctionCreditsTable)
		.where(eq(correctionCreditsTable.userId, userId))

	if (creditBalance > 0) {
		await tx.insert(correctionCreditsTable).values({
			userId,
			delta: -1,
			source: 'consumption',
		})
		return
	}

	throw new PaymentRequiredError()
}
