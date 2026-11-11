import { and, db, eq, plansTable, subscriptionsTable } from '@app/db'
import { PaymentRequiredError } from '@/core/errors'
import { findActiveAccessGrant } from '@/modules/access-grants/find-active-access-grant'

export async function assertDocxExportAllowed(userId: string): Promise<void> {
	const [subscription] = await db
		.select({ allowsDocxExport: plansTable.allowsDocxExport })
		.from(subscriptionsTable)
		.innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
		.where(
			and(
				eq(subscriptionsTable.userId, userId),
				eq(subscriptionsTable.status, 'active'),
			),
		)

	if (subscription?.allowsDocxExport) {
		return
	}

	const accessGrant = await findActiveAccessGrant(db, userId)

	if (accessGrant?.allowsDocxExport) {
		return
	}

	throw new PaymentRequiredError(
		'A exportação em DOCX está disponível apenas no plano Pro.',
	)
}
