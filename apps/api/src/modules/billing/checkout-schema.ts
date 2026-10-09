import { taxIdSchema } from '@app/shared'
import { z } from 'zod'

export const checkoutBodySchema = z.strictObject({
	planSlug: z.enum(['avulso', 'essencial', 'pro']),
	cpfCnpj: taxIdSchema.optional(),
})

export type CheckoutBody = z.infer<typeof checkoutBodySchema>
