import { z } from 'zod'

export const forgotPasswordSchema = z.object({
	email: z
		.email('Informe um e-mail válido para recuperar o acesso')
		.trim()
		.toLowerCase(),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
