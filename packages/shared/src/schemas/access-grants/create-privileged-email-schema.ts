import { z } from 'zod'

export const createPrivilegedEmailSchema = z.strictObject({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.pipe(z.email('Informe um e-mail válido')),
	note: z
		.string()
		.trim()
		.max(200, 'A observação deve ter no máximo 200 caracteres')
		.optional(),
})

export type CreatePrivilegedEmailInput = z.infer<
	typeof createPrivilegedEmailSchema
>
