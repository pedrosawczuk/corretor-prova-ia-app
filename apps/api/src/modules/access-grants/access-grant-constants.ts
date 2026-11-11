export const ACCESS_GRANT_DURATION_MONTHS = 3
export const ACCESS_GRANT_PLAN_SLUG = 'pro'
export const INVITE_TTL_DAYS = 14

export const ACCESS_GRANT_REMINDERS = [
	{ kind: '30_days', daysBeforeExpiry: 30 },
	{ kind: '7_days', daysBeforeExpiry: 7 },
	{ kind: '1_day', daysBeforeExpiry: 1 },
] as const

export type AccessGrantReminderKind =
	(typeof ACCESS_GRANT_REMINDERS)[number]['kind']
