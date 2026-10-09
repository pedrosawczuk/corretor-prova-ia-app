import { correctionCreditsTable, db } from '@app/db'
import { insertUser } from './insert-user'

type CorrectionCredit = typeof correctionCreditsTable.$inferSelect

export async function insertCorrectionCredit(
	overrides: Partial<CorrectionCredit> = {},
) {
	const userId = overrides.userId ?? (await insertUser()).id

	const [row] = await db
		.insert(correctionCreditsTable)
		.values({
			delta: 10,
			source: 'purchase',
			...overrides,
			userId,
		})
		.returning()

	return row
}
