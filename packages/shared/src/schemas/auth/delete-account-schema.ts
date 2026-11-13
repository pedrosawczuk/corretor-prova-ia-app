import { z } from 'zod'

export const deleteAccountSchema = z.strictObject({
	email: z
		.email('E-mail inválido')
		.trim()
		.toLowerCase()
		.max(254, 'E-mail inválido'),
	password: z
		.string()
		.min(1, 'Digite sua senha atual')
		.max(128, 'Senha inválida')
		.optional(),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
