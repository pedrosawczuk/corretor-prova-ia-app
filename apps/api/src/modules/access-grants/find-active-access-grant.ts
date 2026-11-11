import {
	accessGrantsTable,
	and,
	type db,
	eq,
	gt,
	isNull,
	plansTable,
} from '@app/db'
import type { BillingTransaction } from '@/modules/billing/billing-transaction'

type DbExecutor = typeof db | BillingTransaction

export async function findActiveAccessGrant(
	executor: DbExecutor,
	userId: string,
	now: Date = new Date(),
) {
	const [grant] = await executor
		.select({
			id: accessGrantsTable.id,
			source: accessGrantsTable.source,
			startsAt: accessGrantsTable.startsAt,
			expiresAt: accessGrantsTable.expiresAt,
			planSlug: plansTable.slug,
			planName: plansTable.name,
			monthlyCorrectionsLimit: plansTable.monthlyCorrectionsLimit,
			allowsDocxExport: plansTable.allowsDocxExport,
		})
		.from(accessGrantsTable)
		.innerJoin(plansTable, eq(accessGrantsTable.planId, plansTable.id))
		.where(
			and(
				eq(accessGrantsTable.userId, userId),
				isNull(accessGrantsTable.revokedAt),
				gt(accessGrantsTable.expiresAt, now),
			),
		)

	return grant
}
