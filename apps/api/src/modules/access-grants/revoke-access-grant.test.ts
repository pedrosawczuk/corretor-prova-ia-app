import { accessGrantsTable, db, privilegedEmailsTable, user } from '@app/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDbChain } from '@/test/create-db-chain'
import { revokeAccessGrantModule } from './revoke-access-grant'

describe('revokeAccessGrantModule (unit)', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('marca revokedAt em privileged_emails quando a cortesia revogada tem origem privileged_email', async () => {
		vi.mocked(db.select)
			.mockReturnValueOnce(
				createDbChain([
					{
						revokedAt: null,
						source: 'privileged_email',
						userId: 'user-1',
					},
				]) as never,
			)
			.mockReturnValueOnce(
				createDbChain([{ email: 'VIP@Escola.com' }]) as never,
			)

		const txUpdate = vi.fn().mockReturnValue(createDbChain(undefined) as never)
		vi.mocked(db.transaction).mockImplementationOnce(async (cb) =>
			cb({ update: txUpdate } as never),
		)

		const send = vi.fn()
		const status = vi.fn().mockReturnValue({ send })

		await revokeAccessGrantModule(
			{ params: { id: 'grant-1' } } as never,
			{ status } as never,
		)

		expect(status).toHaveBeenCalledWith(204)
		expect(txUpdate).toHaveBeenCalledWith(accessGrantsTable)
		expect(txUpdate).toHaveBeenCalledWith(privilegedEmailsTable)
		expect(user).toBeDefined()
	})
})
