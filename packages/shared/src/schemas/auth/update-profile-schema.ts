import { z } from 'zod'

export const updateProfileSchema = z.object({
	name: z.string().min(3, 'Informe seu nome completo (mínimo 3 letras)'),
	phoneNumber: z
		.string()
		.trim()
		.optional()
		.refine((value) => !value || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value), {
			message: 'Informe um telefone válido no formato (DD) 99999-9999',
		}),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
