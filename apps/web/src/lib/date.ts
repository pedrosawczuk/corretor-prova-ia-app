import dayjs from '@app/dayjs'

export function formatDate(
	date: Date | string,
	template = 'DD [de] MMMM [de] YYYY',
) {
	return dayjs(date).format(template)
}

export function formatRelativeDate(date: Date | string) {
	const target = dayjs(date)
	const now = dayjs()

	const diffMinutes = now.diff(target, 'minute')
	if (diffMinutes < 1) return 'agora mesmo'
	if (diffMinutes < 60) return `há ${diffMinutes} min`

	const diffHours = now.diff(target, 'hour')
	if (diffHours < 24) return `há ${diffHours} h`

	const diffDays = now.diff(target, 'day')
	if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`

	return target.format('DD MMM')
}
