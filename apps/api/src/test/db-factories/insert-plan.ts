import { db, plansTable } from '@app/db'
import { makePlan } from '@/test/factories/make-plan'

type Plan = typeof plansTable.$inferSelect

export async function insertPlan(overrides: Partial<Plan> = {}) {
	const [row] = await db
		.insert(plansTable)
		.values(makePlan(overrides))
		.returning()

	return row
}
