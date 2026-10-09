import type { db } from '@app/db'

export type BillingTransaction = Parameters<
	Parameters<typeof db.transaction>[0]
>[0]
