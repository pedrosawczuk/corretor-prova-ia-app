import { z } from 'zod'

export const billingWebhookPayloadSchema = z.object({
	id: z.string(),
	event: z.string(),
	payment: z.record(z.string(), z.unknown()).optional(),
	subscription: z.record(z.string(), z.unknown()).optional(),
})

export type BillingWebhookPayload = z.infer<typeof billingWebhookPayloadSchema>
