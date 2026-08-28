import { z } from 'zod'

export const signInWithEmailSchema = z.object({
	email: z.email('Informe um e-mail válido para acessar').trim().toLowerCase(),
	password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

export type SignInWithEmailInput = z.infer<typeof signInWithEmailSchema>
