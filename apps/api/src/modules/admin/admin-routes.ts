import type { FastifyInstance } from 'fastify'
import { getAdminOverviewModule } from './get-admin-overview'
import { listAdminAuditLogsModule } from './list-admin-audit-logs'
import { listAdminSessionsModule } from './list-admin-sessions'
import { listAdminUsersModule } from './list-admin-users'

const ADMIN_ROUTE_OPTIONS = {
	config: {
		rateLimit: {
			max: 60,
			timeWindow: '1 minute',
			ban: 3,
		},
	},
}

export function adminRoutes(app: FastifyInstance) {
	app.get('/overview', ADMIN_ROUTE_OPTIONS, getAdminOverviewModule)
	app.get('/users', ADMIN_ROUTE_OPTIONS, listAdminUsersModule)
	app.get('/sessions', ADMIN_ROUTE_OPTIONS, listAdminSessionsModule)
	app.get('/audit-logs', ADMIN_ROUTE_OPTIONS, listAdminAuditLogsModule)
}
