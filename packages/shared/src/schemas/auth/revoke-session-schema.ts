import { z } from 'zod'

export const revokeSessionSchema = z.strictObject({
	token: z
		.string()
		.min(1, 'Token da sessão é obrigatório')
		.max(512, 'Token da sessão inválido'),
})

export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>
