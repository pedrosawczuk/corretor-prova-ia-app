import type { FastifyInstance } from 'fastify'
import { billingWebhookModule } from './billing-webhook'
import { cancelSubscriptionModule } from './cancel-subscription'
import { changePlanModule } from './change-plan'
import { changePlanBodySchema } from './change-plan-schema'
import { checkoutBodySchema } from './checkout-schema'
import { createCheckoutModule } from './create-checkout'
import { getBillingStatusModule } from './get-billing-status'

export function billingRoutes(app: FastifyInstance) {
	app.post(
		'/checkout',
		{ schema: { body: checkoutBodySchema } },
		createCheckoutModule,
	)

	app.get('/status', getBillingStatusModule)

	app.post(
		'/change-plan',
		{ schema: { body: changePlanBodySchema } },
		changePlanModule,
	)

	app.post('/cancel', cancelSubscriptionModule)

	app.register(async (instance) => {
		instance.addContentTypeParser(
			'application/json',
			{ parseAs: 'buffer' },
			(_request, body, done) => done(null, body),
		)

		instance.post('/webhook', billingWebhookModule)
	})
}
