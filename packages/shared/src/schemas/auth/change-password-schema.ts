import { z } from 'zod'

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(8, 'Informe sua senha atual'),
		newPassword: z
			.string()
			.min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
		confirmPassword: z.string().min(8, 'Confirme a nova senha'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'As senhas não coincidem',
		path: ['confirmPassword'],
	})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
