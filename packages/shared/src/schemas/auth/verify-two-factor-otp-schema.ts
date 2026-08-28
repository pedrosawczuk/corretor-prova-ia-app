import { z } from 'zod'

export const verifyTwoFactorOtpSchema = z.object({
	code: z.string().min(1, 'Informe o código recebido por e-mail'),
	trustDevice: z.boolean().optional(),
})

export type VerifyTwoFactorOtpInput = z.infer<typeof verifyTwoFactorOtpSchema>
