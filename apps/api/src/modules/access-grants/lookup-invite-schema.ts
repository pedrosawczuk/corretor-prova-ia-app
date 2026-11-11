import { z } from 'zod'

export const lookupInviteBodySchema = z.strictObject({
	token: z.string().min(20).max(128),
})

export type LookupInviteBody = z.infer<typeof lookupInviteBodySchema>
