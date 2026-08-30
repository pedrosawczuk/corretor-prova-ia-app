import { z } from 'zod'

export const forgotPasswordSchema = z.strictObject({
	email: z
		.email('Informe um e-mail válido para recuperar o acesso')
		.trim()
		.toLowerCase()
		.max(254, 'E-mail muito longo'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
