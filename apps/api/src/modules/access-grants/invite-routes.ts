import type { FastifyInstance } from 'fastify'
import { lookupInviteModule } from './lookup-invite'
import { lookupInviteBodySchema } from './lookup-invite-schema'

export function inviteRoutes(app: FastifyInstance) {
	app.post(
		'/lookup',
		{
			schema: { body: lookupInviteBodySchema },
			config: {
				rateLimit: {
					max: 10,
					timeWindow: '1 minute',
					ban: 3,
				},
			},
		},
		lookupInviteModule,
	)
}
