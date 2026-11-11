import { createInviteSchema, createPrivilegedEmailSchema } from '@app/shared'
import type { FastifyInstance } from 'fastify'
import { createInviteModule } from './create-invite'
import { createPrivilegedEmailModule } from './create-privileged-email'
import { deletePrivilegedEmailModule } from './delete-privileged-email'
import { listAccessGrantsModule } from './list-access-grants'
import { listInvitesModule } from './list-invites'
import { listPrivilegedEmailsModule } from './list-privileged-emails'
import { resendInviteModule } from './resend-invite'
import { resourceIdParamsSchema } from './resource-id-params-schema'
import { revokeAccessGrantModule } from './revoke-access-grant'
import { revokeInviteModule } from './revoke-invite'

const ADMIN_ROUTE_OPTIONS = {
	config: {
		rateLimit: {
			max: 60,
			timeWindow: '1 minute',
			ban: 3,
		},
	},
}

const ID_PARAMS_OPTIONS = {
	...ADMIN_ROUTE_OPTIONS,
	schema: { params: resourceIdParamsSchema },
}

export function accessGrantAdminRoutes(app: FastifyInstance) {
	app.get('/invites', ADMIN_ROUTE_OPTIONS, listInvitesModule)
	app.post(
		'/invites',
		{ ...ADMIN_ROUTE_OPTIONS, schema: { body: createInviteSchema } },
		createInviteModule,
	)
	app.post('/invites/:id/resend', ID_PARAMS_OPTIONS, resendInviteModule)
	app.delete('/invites/:id', ID_PARAMS_OPTIONS, revokeInviteModule)

	app.get('/privileged-emails', ADMIN_ROUTE_OPTIONS, listPrivilegedEmailsModule)
	app.post(
		'/privileged-emails',
		{ ...ADMIN_ROUTE_OPTIONS, schema: { body: createPrivilegedEmailSchema } },
		createPrivilegedEmailModule,
	)
	app.delete(
		'/privileged-emails/:id',
		ID_PARAMS_OPTIONS,
		deletePrivilegedEmailModule,
	)

	app.get('/access-grants', ADMIN_ROUTE_OPTIONS, listAccessGrantsModule)
	app.post(
		'/access-grants/:id/revoke',
		ID_PARAMS_OPTIONS,
		revokeAccessGrantModule,
	)
}
