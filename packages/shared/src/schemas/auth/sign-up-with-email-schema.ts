import { z } from 'zod'

export const signUpWithEmailSchema = z.object({
	name: z.string().min(3, 'Informe seu nome completo (mínimo 3 letras)'),
	email: z.email('Informe um e-mail válido').trim().toLowerCase(),
	password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

export type SignUpWithEmailInput = z.infer<typeof signUpWithEmailSchema>
