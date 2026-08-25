import { z } from 'zod'

export const signInWithEmailSchema = z.object({
	email: z.email().trim().toLowerCase(),
	password: z.string().min(6),
})

export type SignInWithEmailInput = z.infer<typeof signInWithEmailSchema>
