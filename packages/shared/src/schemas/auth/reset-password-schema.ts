import { z } from 'zod'

export const resetPasswordSchema = z.object({
	token: z.string().min(1, 'Token de redefinição inválido'),
	password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
