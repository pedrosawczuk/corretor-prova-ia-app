import { z } from 'zod'

export const signUpWithEmailSchema = z.object({
	name: z.string().min(2),
	email: z.email().trim().toLowerCase(),
	password: z.string().min(6),
})

export type SignUpWithEmailInput = z.infer<typeof signUpWithEmailSchema>
