import { z } from 'zod'

export const enableTwoFactorSchema = z.strictObject({
	password: z
		.string()
		.min(8, 'Informe sua senha atual')
		.max(128, 'A senha deve ter no máximo 128 caracteres')
		.optional(),
	method: z.enum(['totp', 'otp']).default('totp'),
})

export type EnableTwoFactorInput = z.infer<typeof enableTwoFactorSchema>
