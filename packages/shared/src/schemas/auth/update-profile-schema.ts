import { z } from 'zod'

export const updateProfileSchema = z.object({
	name: z.string().min(3, 'Informe seu nome completo (mínimo 3 letras)'),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
