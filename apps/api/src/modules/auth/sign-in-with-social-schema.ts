import { z } from 'zod'

export const signInWithSocialSchema = z.object({
	provider: z.enum(['google']),
	callbackURL: z.string().url().default('http://localhost:3000/dashboard'),
})

export type SignInWithSocialInput = z.infer<typeof signInWithSocialSchema>
