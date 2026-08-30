import { createSubjectSchema } from '@app/shared'
import type { FastifyInstance } from 'fastify'
import { createAdminSubjectModule } from './create-admin-subject'
import { deleteAdminSubjectModule } from './delete-admin-subject'
import { getAdminOverviewModule } from './get-admin-overview'
import { getAdminSubjectParamsSchema } from './get-admin-subject-schema'
import { listAdminAuditLogsModule } from './list-admin-audit-logs'
import { listAdminSessionsModule } from './list-admin-sessions'
import { listAdminSubjectsModule } from './list-admin-subjects'
import { listAdminSubjectsQuerySchema } from './list-admin-subjects-schema'
import { listAdminUsersModule } from './list-admin-users'
import { listAdminUsersQuerySchema } from './list-admin-users-schema'
import { updateAdminSubjectModule } from './update-admin-subject'

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
	app.get(
		'/users',
		{
			...ADMIN_ROUTE_OPTIONS,
			schema: { querystring: listAdminUsersQuerySchema },
		},
		listAdminUsersModule,
	)
	app.get('/sessions', ADMIN_ROUTE_OPTIONS, listAdminSessionsModule)
	app.get('/audit-logs', ADMIN_ROUTE_OPTIONS, listAdminAuditLogsModule)

	app.get(
		'/subjects',
		{
			...ADMIN_ROUTE_OPTIONS,
			schema: { querystring: listAdminSubjectsQuerySchema },
		},
		listAdminSubjectsModule,
	)
	app.post(
		'/subjects',
		{ ...ADMIN_ROUTE_OPTIONS, schema: { body: createSubjectSchema } },
		createAdminSubjectModule,
	)
	app.patch(
		'/subjects/:id',
		{
			...ADMIN_ROUTE_OPTIONS,
			schema: {
				params: getAdminSubjectParamsSchema,
				body: createSubjectSchema,
			},
		},
		updateAdminSubjectModule,
	)
	app.delete(
		'/subjects/:id',
		{
			...ADMIN_ROUTE_OPTIONS,
			schema: { params: getAdminSubjectParamsSchema },
		},
		deleteAdminSubjectModule,
	)
}
