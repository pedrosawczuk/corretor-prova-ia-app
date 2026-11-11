import {
	ACCESS_GRANT_REMINDERS,
	type AccessGrantReminderKind,
} from './access-grant-constants'

const DAY_MS = 1000 * 60 * 60 * 24

export function pickDueAccessGrantReminder(
	expiresAt: Date,
	sentKinds: AccessGrantReminderKind[],
	now: Date = new Date(),
) {
	const remainingMs = expiresAt.getTime() - now.getTime()

	if (remainingMs <= 0) {
		return null
	}

	const applicable = ACCESS_GRANT_REMINDERS.filter(
		(reminder) => remainingMs <= reminder.daysBeforeExpiry * DAY_MS,
	)
	const mostUrgent = applicable.reduce<
		(typeof ACCESS_GRANT_REMINDERS)[number] | null
	>(
		(current, reminder) =>
			!current || reminder.daysBeforeExpiry < current.daysBeforeExpiry
				? reminder
				: current,
		null,
	)

	if (!mostUrgent || sentKinds.includes(mostUrgent.kind)) {
		return null
	}

	return {
		kind: mostUrgent.kind,
		kindsToMark: applicable.map((reminder) => reminder.kind),
	}
}
