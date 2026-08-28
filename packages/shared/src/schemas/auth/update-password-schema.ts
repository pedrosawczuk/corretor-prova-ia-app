import { z } from 'zod'

export const updatePasswordSchema = z.object({
	currentPassword: z.string().min(8, 'Informe sua senha atual'),
	newPassword: z
		.string()
		.min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
})

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
