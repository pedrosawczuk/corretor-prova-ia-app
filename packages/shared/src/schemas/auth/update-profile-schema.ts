import { z } from 'zod'

export const updateProfileSchema = z.strictObject({
	name: z
		.string()
		.trim()
		.min(3, 'Informe seu nome completo (mínimo 3 letras)')
		.max(100, 'O nome deve ter no máximo 100 caracteres'),
	phoneNumber: z
		.string()
		.trim()
		.max(20, 'Telefone inválido')
		.optional()
		.refine((value) => !value || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value), {
			message: 'Informe um telefone válido no formato (DD) 99999-9999',
		}),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
