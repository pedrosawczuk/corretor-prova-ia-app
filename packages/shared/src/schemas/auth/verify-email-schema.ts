import { z } from 'zod'

export const verifyEmailQuerySchema = z.strictObject({
	token: z
		.string()
		.min(1, 'Token de verificação inválido')
		.max(512, 'Token de verificação inválido'),
	callbackURL: z.url('URL de retorno inválida').max(2048).optional(),
})

export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>
