import { accessGrantsTable, db } from '@app/db'
import { insertPlan } from './insert-plan'
import { insertUser } from './insert-user'

type AccessGrant = typeof accessGrantsTable.$inferSelect

const DAY_MS = 1000 * 60 * 60 * 24

export async function insertAccessGrant(overrides: Partial<AccessGrant> = {}) {
	const userId = overrides.userId ?? (await insertUser()).id
	const planId =
		overrides.planId ??
		(
			await insertPlan({
				slug: 'pro',
				name: 'Pro',
				monthlyCorrectionsLimit: 500,
				allowsDocxExport: true,
			})
		).id
	const startsAt = overrides.startsAt ?? new Date()

	const [row] = await db
		.insert(accessGrantsTable)
		.values({
			source: 'invite',
			expiresAt: new Date(startsAt.getTime() + 90 * DAY_MS),
			...overrides,
			userId,
			planId,
			startsAt,
		})
		.returning()

	return row
}
