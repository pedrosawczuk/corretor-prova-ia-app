import { z } from 'zod'

export const updatePasswordSchema = z.object({
	currentPassword: z.string().min(6, 'Informe sua senha atual'),
	newPassword: z
		.string()
		.min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
})

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
