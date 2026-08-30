import { z } from 'zod'

export const updatePasswordSchema = z.strictObject({
	currentPassword: z
		.string()
		.min(8, 'Informe sua senha atual')
		.max(128, 'A senha deve ter no máximo 128 caracteres'),
	newPassword: z
		.string()
		.min(8, 'A nova senha deve ter no mínimo 8 caracteres')
		.max(128, 'A senha deve ter no máximo 128 caracteres'),
})

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
