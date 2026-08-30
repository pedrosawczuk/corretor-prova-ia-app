import { z } from 'zod'

export const verifyTotpSchema = z.strictObject({
	code: z
		.string()
		.regex(/^\d{6}$/, 'Informe o código de 6 dígitos do aplicativo'),
	trustDevice: z.boolean().optional(),
})

export type VerifyTotpInput = z.infer<typeof verifyTotpSchema>
