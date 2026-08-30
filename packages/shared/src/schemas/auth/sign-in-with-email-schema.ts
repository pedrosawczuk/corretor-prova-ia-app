import { z } from 'zod'

export const signInWithEmailSchema = z.strictObject({
	email: z
		.email('Informe um e-mail válido para acessar')
		.trim()
		.toLowerCase()
		.max(254, 'E-mail muito longo'),
	password: z
		.string()
		.min(8, 'A senha deve ter no mínimo 8 caracteres')
		.max(128, 'A senha deve ter no máximo 128 caracteres'),
})

export type SignInWithEmailInput = z.infer<typeof signInWithEmailSchema>
