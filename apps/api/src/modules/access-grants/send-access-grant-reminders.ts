import {
	accessGrantRemindersTable,
	accessGrantsTable,
	and,
	db,
	eq,
	gt,
	inArray,
	isNull,
	lte,
	notExists,
	subscriptionsTable,
	user as userTable,
} from '@app/db'
import { sendAccessGrantReminderEmail } from '@/lib/mail/mail'
import {
	ACCESS_GRANT_REMINDERS,
	type AccessGrantReminderKind,
} from './access-grant-constants'
import { buildAccessGrantReminderCopy } from './build-access-grant-reminder-copy'
import { pickDueAccessGrantReminder } from './pick-due-access-grant-reminder'

const DAY_MS = 1000 * 60 * 60 * 24

const WIDEST_REMINDER_WINDOW_DAYS = Math.max(
	...ACCESS_GRANT_REMINDERS.map((reminder) => reminder.daysBeforeExpiry),
)

async function findGrantsInReminderWindow(now: Date) {
	return db
		.select({
			id: accessGrantsTable.id,
			expiresAt: accessGrantsTable.expiresAt,
			userName: userTable.name,
			userEmail: userTable.email,
		})
		.from(accessGrantsTable)
		.innerJoin(userTable, eq(accessGrantsTable.userId, userTable.id))
		.where(
			and(
				isNull(accessGrantsTable.revokedAt),
				gt(accessGrantsTable.expiresAt, now),
				lte(
					accessGrantsTable.expiresAt,
					new Date(now.getTime() + WIDEST_REMINDER_WINDOW_DAYS * DAY_MS),
				),
				notExists(
					db
						.select({ id: subscriptionsTable.id })
						.from(subscriptionsTable)
						.where(
							and(
								eq(subscriptionsTable.userId, accessGrantsTable.userId),
								inArray(subscriptionsTable.status, ['active', 'past_due']),
							),
						),
				),
			),
		)
}

async function findSentKindsByGrant(grantIds: string[]) {
	const rows = grantIds.length
		? await db
				.select({
					grantId: accessGrantRemindersTable.grantId,
					kind: accessGrantRemindersTable.kind,
				})
				.from(accessGrantRemindersTable)
				.where(inArray(accessGrantRemindersTable.grantId, grantIds))
		: []

	const sentKindsByGrant = new Map<string, AccessGrantReminderKind[]>()

	for (const row of rows) {
		sentKindsByGrant.set(row.grantId, [
			...(sentKindsByGrant.get(row.grantId) ?? []),
			row.kind,
		])
	}

	return sentKindsByGrant
}

export async function sendAccessGrantReminders(
	now: Date = new Date(),
): Promise<number> {
	const grants = await findGrantsInReminderWindow(now)
	const sentKindsByGrant = await findSentKindsByGrant(
		grants.map((grant) => grant.id),
	)

	let sentCount = 0

	for (const grant of grants) {
		const due = pickDueAccessGrantReminder(
			grant.expiresAt,
			sentKindsByGrant.get(grant.id) ?? [],
			now,
		)

		if (!due) {
			continue
		}

		const inserted = await db
			.insert(accessGrantRemindersTable)
			.values(
				due.kindsToMark.map((kind) => ({ grantId: grant.id, kind, sentAt: now })),
			)
			.onConflictDoNothing()
			.returning({ kind: accessGrantRemindersTable.kind })

		if (!inserted.some((row) => row.kind === due.kind)) {
			continue
		}

		try {
			await sendAccessGrantReminderEmail({
				to: grant.userEmail,
				name: grant.userName,
				...buildAccessGrantReminderCopy(due.kind, grant.expiresAt),
			})
			sentCount += 1
		} catch (error) {
			await db
				.delete(accessGrantRemindersTable)
				.where(
					and(
						eq(accessGrantRemindersTable.grantId, grant.id),
						eq(accessGrantRemindersTable.kind, due.kind),
					),
				)
			console.error('[access grants] Falha ao enviar lembrete de cortesia.', {
				grantId: grant.id,
				kind: due.kind,
				error,
			})
		}
	}

	return sentCount
}
