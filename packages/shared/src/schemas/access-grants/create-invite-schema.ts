import { z } from 'zod'

export const createInviteSchema = z.strictObject({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.pipe(z.email('Informe um e-mail válido')),
})

export type CreateInviteInput = z.infer<typeof createInviteSchema>
