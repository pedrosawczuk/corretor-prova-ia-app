import dayjs from '@app/dayjs'
import type { PerformanceOverview } from '@app/shared'
import type { Classroom } from '@/hooks/use-classrooms'

export const GROWTH_MONTHS = 6
export const MAX_CLASSROOMS_IN_CHART = 6

export function buildClassroomPerformanceData(
	byClassroom: PerformanceOverview['byClassroom'],
) {
	return [...byClassroom]
		.sort((a, b) => a.averageScorePercentage - b.averageScorePercentage)
		.slice(0, MAX_CLASSROOMS_IN_CHART)
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
