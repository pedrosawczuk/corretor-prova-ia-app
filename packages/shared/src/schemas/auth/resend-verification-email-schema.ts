import { z } from 'zod'

export const resendVerificationEmailSchema = z.strictObject({
	email: z
		.email('Informe um e-mail válido para reenviar a confirmação')
		.trim()
		.toLowerCase()
		.max(254, 'E-mail muito longo'),
})

export type ResendVerificationEmailInput = z.infer<
	typeof resendVerificationEmailSchema
>
