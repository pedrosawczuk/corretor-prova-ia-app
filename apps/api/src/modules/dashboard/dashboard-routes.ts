import type { FastifyInstance } from 'fastify'
import { getPerformanceOverviewModule } from './get-performance-overview'

export function dashboardRoutes(app: FastifyInstance) {
	app.get('/performance-overview', getPerformanceOverviewModule)
}
