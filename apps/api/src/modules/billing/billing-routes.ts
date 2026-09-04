import type { FastifyInstance } from 'fastify'
import { billingWebhookModule } from './billing-webhook'
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

	app.register(async (instance) => {
		instance.addContentTypeParser(
			'application/json',
			{ parseAs: 'buffer' },
			(_request, body, done) => done(null, body),
		)

		instance.post('/webhook', billingWebhookModule)
	})
}
