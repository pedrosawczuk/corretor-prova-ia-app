import { z } from 'zod'

export const signUpWithEmailSchema = z.strictObject({
	name: z
		.string()
		.trim()
		.min(3, 'Informe seu nome completo (mínimo 3 letras)')
		.max(100, 'O nome deve ter no máximo 100 caracteres'),
	email: z
		.email('Informe um e-mail válido')
		.trim()
		.toLowerCase()
		.max(254, 'E-mail muito longo'),
	password: z
		.string()
		.min(8, 'A senha deve ter no mínimo 8 caracteres')
		.max(128, 'A senha deve ter no máximo 128 caracteres'),
})

export type SignUpWithEmailInput = z.infer<typeof signUpWithEmailSchema>
