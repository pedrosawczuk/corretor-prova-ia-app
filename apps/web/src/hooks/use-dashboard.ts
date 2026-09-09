import type { PerformanceOverview } from '@app/shared'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const dashboardKeys = {
	performanceOverview: ['dashboard', 'performance-overview'] as const,
}

export function usePerformanceOverview() {
	return useQuery({
		queryKey: dashboardKeys.performanceOverview,
		queryFn: () =>
			apiClient<PerformanceOverview>('/dashboard/performance-overview'),
	})
}
