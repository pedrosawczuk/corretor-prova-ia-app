import { z } from 'zod'

export const billingWebhookPayloadSchema = z.object({
	id: z.string(),
	event: z.string(),
	data: z.record(z.string(), z.unknown()).default({}),
})

export type BillingWebhookPayload = z.infer<typeof billingWebhookPayloadSchema>
