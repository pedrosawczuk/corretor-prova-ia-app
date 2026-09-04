import { z } from 'zod'

export const disableTwoFactorSchema = z.strictObject({
	password: z
		.string()
		.min(8, 'Informe sua senha atual')
		.max(128, 'A senha deve ter no máximo 128 caracteres'),
})

export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>
