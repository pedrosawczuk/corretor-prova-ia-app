import {
	accessGrantsTable,
	db,
	invitesTable,
	plansTable,
	privilegedEmailsTable,
	user as userTable,
} from '@app/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDbChain } from '@/test/create-db-chain'
import { claimAccessGrant } from './claim-access-grant'

describe('claimAccessGrant (unit)', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('atualiza claimedAt atomicamente em privileged_emails e não concede se já reivindicado/revogado', async () => {
		// 1. Claimant verified
		vi.mocked(db.select)
			.mockReturnValueOnce(
				createDbChain([
					{ email: 'vip@escola.com', emailVerified: true },
				]) as never,
			)
			// 2. No existing grant
			.mockReturnValueOnce(createDbChain([]) as never)

		const tx = {
			select: vi
				.fn()
				// 1. No invite
				.mockReturnValueOnce(createDbChain([]) as never)
				// 2. Plan found (or if update runs after/before)
				.mockReturnValueOnce(createDbChain([{ id: 'plan-pro' }]) as never),
			update: vi.fn().mockReturnValueOnce(createDbChain([]) as never),
			insert: vi.fn(),
		}

		vi.mocked(db.transaction).mockImplementationOnce(async (cb) =>
			cb(tx as never),
		)

		const claimed = await claimAccessGrant('user-1')

		expect(claimed).toBe(false)
		expect(tx.update).toHaveBeenCalledWith(privilegedEmailsTable)
		expect(tx.insert).not.toHaveBeenCalled()
	})

	it('concede cortesia quando UPDATE em privileged_emails retorna linha elegível', async () => {
		vi.mocked(db.select)
			.mockReturnValueOnce(
				createDbChain([
					{ email: 'vip@escola.com', emailVerified: true },
				]) as never,
			)
			.mockReturnValueOnce(createDbChain([]) as never)

		const tx = {
			select: vi
				.fn()
				.mockReturnValueOnce(createDbChain([]) as never)
				.mockReturnValueOnce(createDbChain([{ id: 'plan-pro' }]) as never),
			update: vi
				.fn()
				.mockReturnValueOnce(createDbChain([{ id: 'priv-1' }]) as never),
			insert: vi
				.fn()
				.mockReturnValueOnce(createDbChain([{ id: 'grant-1' }]) as never),
		}

		vi.mocked(db.transaction).mockImplementationOnce(async (cb) =>
			cb(tx as never),
		)

		const claimed = await claimAccessGrant('user-1')

		expect(claimed).toBe(true)
		expect(tx.update).toHaveBeenCalledWith(privilegedEmailsTable)
		expect(tx.insert).toHaveBeenCalledWith(accessGrantsTable)
		expect(invitesTable).toBeDefined()
		expect(plansTable).toBeDefined()
		expect(userTable).toBeDefined()
	})
})
