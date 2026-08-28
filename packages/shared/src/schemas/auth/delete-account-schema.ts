import { z } from 'zod'

export const deleteAccountSchema = z.object({
	email: z.string().email('E-mail inválido'),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
