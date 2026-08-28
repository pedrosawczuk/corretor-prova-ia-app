import { z } from 'zod'

export const verifyEmailQuerySchema = z.object({
	token: z.string().min(1, 'Token de verificação inválido'),
	callbackURL: z.string().optional(),
})

export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>
