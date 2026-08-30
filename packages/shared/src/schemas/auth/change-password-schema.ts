import { z } from 'zod'

export const changePasswordSchema = z
	.strictObject({
		currentPassword: z
			.string()
			.min(8, 'Informe sua senha atual')
			.max(128, 'A senha deve ter no máximo 128 caracteres'),
		newPassword: z
			.string()
			.min(8, 'A nova senha deve ter no mínimo 8 caracteres')
			.max(128, 'A senha deve ter no máximo 128 caracteres'),
		confirmPassword: z
			.string()
			.min(8, 'Confirme a nova senha')
			.max(128, 'A senha deve ter no máximo 128 caracteres'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'As senhas não coincidem',
		path: ['confirmPassword'],
	})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
