import { z } from 'zod'

export const deleteAccountSchema = z.strictObject({
	email: z
		.email('E-mail inválido')
		.trim()
		.toLowerCase()
		.max(254, 'E-mail inválido'),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
