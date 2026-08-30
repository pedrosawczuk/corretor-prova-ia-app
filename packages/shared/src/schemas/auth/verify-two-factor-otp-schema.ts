import { z } from 'zod'

export const verifyTwoFactorOtpSchema = z.strictObject({
	code: z.string().regex(/^\d{6}$/, 'Informe o código de 6 dígitos recebido por e-mail'),
	trustDevice: z.boolean().optional(),
})

export type VerifyTwoFactorOtpInput = z.infer<typeof verifyTwoFactorOtpSchema>
