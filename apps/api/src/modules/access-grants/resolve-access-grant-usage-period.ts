import dayjs from '@app/dayjs'

interface AccessGrantPeriodSource {
	startsAt: Date
	expiresAt: Date
}

export function resolveAccessGrantUsagePeriod(
	grant: AccessGrantPeriodSource,
	now: Date = new Date(),
) {
	const elapsedMonths = Math.max(0, dayjs(now).diff(grant.startsAt, 'month'))
	const start = dayjs(grant.startsAt).add(elapsedMonths, 'month').toDate()
	const nextMonth = dayjs(start).add(1, 'month').toDate()
	const end = nextMonth < grant.expiresAt ? nextMonth : grant.expiresAt

	return { start, end }
}
