import { z } from 'zod'

export const signInWithEmailSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})

export type SignInWithEmailInput = z.infer<typeof signInWithEmailSchema>
