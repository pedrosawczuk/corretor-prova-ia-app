import { z } from 'zod'

export const disableTwoFactorSchema = z.object({
	password: z.string().min(6, 'Informe sua senha atual'),
})

export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>
