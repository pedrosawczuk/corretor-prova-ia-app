import { z } from 'zod'

export const verifyTotpSchema = z.object({
	code: z.string().min(6, 'Informe o código de 6 dígitos do aplicativo'),
	trustDevice: z.boolean().optional(),
})

export type VerifyTotpInput = z.infer<typeof verifyTotpSchema>
