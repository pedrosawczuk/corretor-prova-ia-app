import { accessGrantsTable, db, eq, invitesTable } from '@app/db'
import { describe, expect, it } from 'vitest'
import { insertAccessGrant } from '@/test/db-factories/insert-access-grant'
import { insertInvite } from '@/test/db-factories/insert-invite'
import { insertPlan } from '@/test/db-factories/insert-plan'
import { insertPrivilegedEmail } from '@/test/db-factories/insert-privileged-email'
import { insertUser } from '@/test/db-factories/insert-user'
import { claimAccessGrant } from './claim-access-grant'

const DAY_MS = 1000 * 60 * 60 * 24

async function insertProPlan() {
	return insertPlan({
		slug: 'pro',
		name: 'Pro',
		monthlyCorrectionsLimit: 500,
		allowsDocxExport: true,
	})
}

async function selectGrants(userId: string) {
	return db
		.select()
		.from(accessGrantsTable)
		.where(eq(accessGrantsTable.userId, userId))
}

describe('claimAccessGrant (integração)', () => {
	it('cria cortesia de 3 meses do Pro e marca o convite como aceito', async () => {
		const plan = await insertProPlan()
		const user = await insertUser({ email: 'prof@escola.com' })
		const invite = await insertInvite({ email: 'prof@escola.com' })
		const now = new Date('2026-11-09T12:00:00Z')

		const claimed = await claimAccessGrant(user.id, now)

		expect(claimed).toBe(true)
		expect(await selectGrants(user.id)).toEqual([
			expect.objectContaining({
				planId: plan.id,
				source: 'invite',
				inviteId: invite.id,
				startsAt: now,
				expiresAt: new Date('2027-02-09T12:00:00Z'),
				revokedAt: null,
			}),
		])
		const [updatedInvite] = await db
			.select()
			.from(invitesTable)
			.where(eq(invitesTable.id, invite.id))
		expect(updatedInvite.acceptedAt).toEqual(now)
	})

	it('cria cortesia para e-mail privilegiado sem convite', async () => {
		await insertProPlan()
		const user = await insertUser({ email: 'parceiro@escola.com' })
		await insertPrivilegedEmail({ email: 'parceiro@escola.com' })

		expect(await claimAccessGrant(user.id)).toBe(true)
		expect(await selectGrants(user.id)).toEqual([
			expect.objectContaining({ source: 'privileged_email', inviteId: null }),
		])
	})

	it('compara o e-mail sem diferenciar maiúsculas', async () => {
		await insertProPlan()
		const user = await insertUser({ email: 'Prof@Escola.com' })
		await insertPrivilegedEmail({ email: 'prof@escola.com' })

		expect(await claimAccessGrant(user.id)).toBe(true)
	})

	it('não cria cortesia quando o e-mail não foi verificado', async () => {
		await insertProPlan()
		const user = await insertUser({
			email: 'prof@escola.com',
			emailVerified: false,
		})
		await insertInvite({ email: 'prof@escola.com' })

		expect(await claimAccessGrant(user.id)).toBe(false)
		expect(await selectGrants(user.id)).toHaveLength(0)
	})

	it('não cria cortesia com convite expirado ou revogado', async () => {
		await insertProPlan()
		const expiredUser = await insertUser({ email: 'expirado@escola.com' })
		await insertInvite({
			email: 'expirado@escola.com',
			expiresAt: new Date(Date.now() - DAY_MS),
		})
		const revokedUser = await insertUser({ email: 'revogado@escola.com' })
		await insertInvite({
			email: 'revogado@escola.com',
			revokedAt: new Date(),
		})

		expect(await claimAccessGrant(expiredUser.id)).toBe(false)
		expect(await claimAccessGrant(revokedUser.id)).toBe(false)
	})

	it('nunca concede uma segunda cortesia, mesmo após a primeira vencer', async () => {
		const plan = await insertProPlan()
		const user = await insertUser({ email: 'prof@escola.com' })
		await insertAccessGrant({
			userId: user.id,
			planId: plan.id,
			startsAt: new Date(Date.now() - 100 * DAY_MS),
			expiresAt: new Date(Date.now() - 10 * DAY_MS),
		})
		await insertInvite({ email: 'prof@escola.com' })

		expect(await claimAccessGrant(user.id)).toBe(false)
		expect(await selectGrants(user.id)).toHaveLength(1)
	})

	it('é idempotente em logins seguidos', async () => {
		await insertProPlan()
		const user = await insertUser({ email: 'prof@escola.com' })
		await insertPrivilegedEmail({ email: 'prof@escola.com' })

		await claimAccessGrant(user.id)
		await claimAccessGrant(user.id)

		expect(await selectGrants(user.id)).toHaveLength(1)
	})

	it('não faz nada quando o e-mail não tem convite nem privilégio', async () => {
		await insertProPlan()
		const user = await insertUser()

		expect(await claimAccessGrant(user.id)).toBe(false)
	})
})
