import dayjs from '@app/dayjs'

export const URGENT_ACCESS_GRANT_DAYS = 7

export function countDaysUntil(date: string, now: Date = new Date()) {
	return Math.max(0, Math.ceil(dayjs(date).diff(now, 'day', true)))
}

export function formatRemainingDays(days: number) {
	if (days <= 1) return 'termina amanhã'
	return `faltam ${days} dias`
}

export const CORTESIA_BANNER_TONE = {
	urgent: {
		container: 'border-warning/30 bg-warning/10',
		icon: 'text-warning',
	},
	calm: {
		container: 'border-primary/20 bg-primary/5',
		icon: 'text-primary',
	},
}
