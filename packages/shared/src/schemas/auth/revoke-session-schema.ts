import { z } from 'zod'

export const revokeSessionSchema = z.object({
	token: z.string().min(1, 'Token da sessão é obrigatório'),
})

export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>
