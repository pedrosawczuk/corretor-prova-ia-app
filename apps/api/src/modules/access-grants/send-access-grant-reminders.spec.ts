import { accessGrantRemindersTable, db, eq } from '@app/db'
import { describe, expect, it, vi } from 'vitest'
import { sendAccessGrantReminderEmail } from '@/lib/mail/mail'
import { insertAccessGrant } from '@/test/db-factories/insert-access-grant'
import { insertPlan } from '@/test/db-factories/insert-plan'
import { insertSubscription } from '@/test/db-factories/insert-subscription'
import { insertUser } from '@/test/db-factories/insert-user'
import { sendAccessGrantReminders } from './send-access-grant-reminders'

const DAY_MS = 1000 * 60 * 60 * 24
const now = new Date('2026-11-09T12:00:00Z')

async function insertGrantExpiringIn(
	days: number,
	email = 'prof@escola.com',
	revokedAt: Date | null = null,
) {
	const user = await insertUser({ name: 'Ana', email })
	const plan = await insertPlan({ slug: `pro-${email}`, name: 'Pro' })

	return insertAccessGrant({
		userId: user.id,
		planId: plan.id,
		startsAt: new Date(now.getTime() - (90 - days) * DAY_MS),
		expiresAt: new Date(now.getTime() + days * DAY_MS),
		revokedAt,
	})
}

async function selectReminderKinds(grantId: string) {
	const rows = await db
		.select({ kind: accessGrantRemindersTable.kind })
		.from(accessGrantRemindersTable)
		.where(eq(accessGrantRemindersTable.grantId, grantId))

	return rows.map((row) => row.kind).sort()
}

describe('sendAccessGrantReminders (integração)', () => {
	it('envia o lembrete de 30 dias uma única vez, mesmo rodando o job de novo', async () => {
		const grant = await insertGrantExpiringIn(29)

		expect(await sendAccessGrantReminders(now)).toBe(1)
		expect(await sendAccessGrantReminders(now)).toBe(0)

		expect(sendAccessGrantReminderEmail).toHaveBeenCalledTimes(1)
		expect(sendAccessGrantReminderEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: 'prof@escola.com',
				name: 'Ana',
				title: 'Sua cortesia do Pro termina em 1 mês',
			}),
		)
		expect(await selectReminderKinds(grant.id)).toEqual(['30_days'])
	})

	it('envia 30, 7 e 1 dia conforme a cortesia se aproxima do fim', async () => {
		const grant = await insertGrantExpiringIn(29)

		await sendAccessGrantReminders(now)
		await sendAccessGrantReminders(new Date(now.getTime() + 23 * DAY_MS))
		await sendAccessGrantReminders(new Date(now.getTime() + 28.5 * DAY_MS))

		const titles = vi
			.mocked(sendAccessGrantReminderEmail)
			.mock.calls.map(([params]) => params.title)
		expect(titles).toEqual([
			'Sua cortesia do Pro termina em 1 mês',
			'Faltam 7 dias de Pro grátis',
			'Sua cortesia termina amanhã',
		])
		expect(await selectReminderKinds(grant.id)).toEqual([
			'1_day',
			'30_days',
			'7_days',
		])
	})

	it('não envia para cortesia revogada, vencida ou ainda longe do fim', async () => {
		await insertGrantExpiringIn(5, 'revogada@escola.com', now)
		await insertGrantExpiringIn(-1, 'vencida@escola.com')
		await insertGrantExpiringIn(45, 'longe@escola.com')

		expect(await sendAccessGrantReminders(now)).toBe(0)
		expect(sendAccessGrantReminderEmail).not.toHaveBeenCalled()
	})

	it('não envia para quem já assinou durante a cortesia', async () => {
		const grant = await insertGrantExpiringIn(5)
		await insertSubscription({ userId: grant.userId, status: 'active' })

		expect(await sendAccessGrantReminders(now)).toBe(0)
	})

	it('libera o lembrete para nova tentativa quando o envio falha', async () => {
		const grant = await insertGrantExpiringIn(5)
		vi.mocked(sendAccessGrantReminderEmail).mockRejectedValueOnce(
			new Error('Resend fora do ar'),
		)

		expect(await sendAccessGrantReminders(now)).toBe(0)
		expect(await selectReminderKinds(grant.id)).toEqual(['30_days'])

		expect(await sendAccessGrantReminders(now)).toBe(1)
		expect(await selectReminderKinds(grant.id)).toEqual(['30_days', '7_days'])
	})
})
