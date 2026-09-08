import { z } from 'zod'

export const changePlanBodySchema = z.strictObject({
	planSlug: z.enum(['essencial', 'pro']),
	immediate: z.boolean().default(false),
})

export type ChangePlanBody = z.infer<typeof changePlanBodySchema>
