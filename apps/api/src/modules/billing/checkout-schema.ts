import { z } from 'zod'

export const checkoutBodySchema = z.strictObject({
	planSlug: z.enum(['avulso', 'essencial', 'pro']),
})

export type CheckoutBody = z.infer<typeof checkoutBodySchema>
