import dayjs from '@app/dayjs'

export const LOGIN_HISTORY_DAYS = 14
export const DEVICE_CHART_COLORS = ['var(--color-primary)', 'var(--color-info)']

export function buildLoginsPerDay(createdAtDates: string[]) {
	return Array.from({ length: LOGIN_HISTORY_DAYS }).map((_, index) => {
		const day = dayjs().subtract(LOGIN_HISTORY_DAYS - 1 - index, 'day')

		const total = createdAtDates.filter((createdAt) =>
			dayjs(createdAt).isSame(day, 'day'),
		).length

		return { day: day.format('DD/MM'), total }
	})
}

export function outcomeBadgeVariant(outcome: 'success' | 'failure') {
	return outcome === 'success' ? 'success-outline' : 'destructive-outline'
}
