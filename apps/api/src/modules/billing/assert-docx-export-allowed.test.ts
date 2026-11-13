import { db, gt, subscriptionsTable } from '@app/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PaymentRequiredError } from '@/core/errors'
import { createDbChain } from '@/test/create-db-chain'
import { assertDocxExportAllowed } from './assert-docx-export-allowed'

describe('assertDocxExportAllowed', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('filtra assinaturas ativas exigindo currentPeriodEnd > now e bloqueia quando expirada', async () => {
		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(createDbChain([]) as never)

		await expect(assertDocxExportAllowed('user-1')).rejects.toBeInstanceOf(
			PaymentRequiredError,
		)
		expect(gt).toHaveBeenCalledWith(
			subscriptionsTable.currentPeriodEnd,
			expect.any(Date),
		)
	})

	it('permite exportação quando há assinatura ativa não expirada com allowsDocxExport', async () => {
		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([{ allowsDocxExport: true }]) as never,
		)

		await expect(assertDocxExportAllowed('user-1')).resolves.toBeUndefined()
	})
})
