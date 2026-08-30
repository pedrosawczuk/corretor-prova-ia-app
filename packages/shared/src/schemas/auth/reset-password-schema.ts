import { z } from 'zod'

export const resetPasswordSchema = z.strictObject({
	token: z
		.string()
		.min(1, 'Token de redefinição inválido')
		.max(512, 'Token de redefinição inválido'),
	password: z
		.string()
		.min(8, 'A senha deve ter no mínimo 8 caracteres')
		.max(128, 'A senha deve ter no máximo 128 caracteres'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
