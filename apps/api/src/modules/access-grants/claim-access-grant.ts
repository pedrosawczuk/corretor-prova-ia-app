import dayjs from '@app/dayjs'
import {
	accessGrantsTable,
	and,
	db,
	eq,
	gt,
	invitesTable,
	isNull,
	plansTable,
	privilegedEmailsTable,
	user as userTable,
} from '@app/db'
import {
	ACCESS_GRANT_DURATION_MONTHS,
	ACCESS_GRANT_PLAN_SLUG,
} from './access-grant-constants'

export async function claimAccessGrant(
	userId: string,
	now: Date = new Date(),
): Promise<boolean> {
	const [claimant] = await db
		.select({ email: userTable.email, emailVerified: userTable.emailVerified })
		.from(userTable)
		.where(eq(userTable.id, userId))

	if (!claimant?.emailVerified) {
		return false
	}

	const [existingGrant] = await db
		.select({ id: accessGrantsTable.id })
		.from(accessGrantsTable)
		.where(eq(accessGrantsTable.userId, userId))

	if (existingGrant) {
		return false
	}

	const email = claimant.email.trim().toLowerCase()

	return db.transaction(async (tx) => {
		const [invite] = await tx
			.select({ id: invitesTable.id })
			.from(invitesTable)
			.where(
				and(
					eq(invitesTable.email, email),
					isNull(invitesTable.acceptedAt),
					isNull(invitesTable.revokedAt),
					gt(invitesTable.expiresAt, now),
				),
			)
			.for('update')

		const [privilegedEmail] = invite
			? []
			: await tx
					.select({ id: privilegedEmailsTable.id })
					.from(privilegedEmailsTable)
					.where(eq(privilegedEmailsTable.email, email))

		if (!invite && !privilegedEmail) {
			return false
		}

		const [plan] = await tx
			.select({ id: plansTable.id })
			.from(plansTable)
			.where(eq(plansTable.slug, ACCESS_GRANT_PLAN_SLUG))

		if (!plan) {
			console.error('[access grants] Plano da cortesia não encontrado.', {
				planSlug: ACCESS_GRANT_PLAN_SLUG,
			})
			return false
		}

		const [grant] = await tx
			.insert(accessGrantsTable)
			.values({
				userId,
				planId: plan.id,
				source: invite ? 'invite' : 'privileged_email',
				inviteId: invite?.id ?? null,
				startsAt: now,
				expiresAt: dayjs(now)
					.add(ACCESS_GRANT_DURATION_MONTHS, 'month')
					.toDate(),
			})
			.onConflictDoNothing({ target: accessGrantsTable.userId })
			.returning({ id: accessGrantsTable.id })

		if (!grant) {
			return false
		}

		if (invite) {
			await tx
				.update(invitesTable)
				.set({ acceptedAt: now })
				.where(eq(invitesTable.id, invite.id))
		}

		return true
	})
}
