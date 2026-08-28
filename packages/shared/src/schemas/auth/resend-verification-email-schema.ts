import { z } from 'zod'

export const resendVerificationEmailSchema = z.object({
	email: z
		.email('Informe um e-mail válido para reenviar a confirmação')
		.trim()
		.toLowerCase(),
})

export type ResendVerificationEmailInput = z.infer<
	typeof resendVerificationEmailSchema
>
