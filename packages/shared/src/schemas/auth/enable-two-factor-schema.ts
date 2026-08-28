import { z } from 'zod'

export const enableTwoFactorSchema = z.object({
	password: z.string().min(8, 'Informe sua senha atual'),
	method: z.enum(['totp', 'otp']).default('totp'),
})

export type EnableTwoFactorInput = z.infer<typeof enableTwoFactorSchema>
