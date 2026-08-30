import dayjs from '@app/dayjs'
import type { Classroom } from '@/hooks/use-classrooms'

export const GROWTH_MONTHS = 6
export const MAX_SUBJECTS = 6

export function buildSubjectData(classrooms: Classroom[]) {
	const counts = new Map<string, number>()

	for (const classroom of classrooms) {
		counts.set(classroom.subject, (counts.get(classroom.subject) ?? 0) + 1)
	}

	return Array.from(counts.entries())
		.map(([subject, count]) => ({ subject, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, MAX_SUBJECTS)
}

export function buildGrowthData(classrooms: Classroom[]) {
	return Array.from({ length: GROWTH_MONTHS }).map((_, index) => {
		const monthEnd = dayjs()
			.subtract(GROWTH_MONTHS - 1 - index, 'month')
			.endOf('month')

		const total = classrooms.filter(
			(classroom) => !dayjs(classroom.createdAt).isAfter(monthEnd),
		).length

		return { month: monthEnd.format('MMM'), total }
	})
}
