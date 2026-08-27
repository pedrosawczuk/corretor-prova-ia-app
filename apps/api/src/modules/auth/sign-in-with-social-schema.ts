import { env } from '@app/env'
import { z } from 'zod'

export const signInWithSocialSchema = z.object({
	provider: z.enum(['google']),
	callbackURL: z
		.string()
		.url()
		.refine(
			(url) => {
				const origin = new URL(url).origin
				const allowedOrigins = [env.BETTER_AUTH_URL, 'http://localhost:3000']
				return allowedOrigins.includes(origin)
			},
			{ message: 'Invalid callback URL domain' },
		)
		.default(`${env.BETTER_AUTH_URL}/dashboard`),
})

export type SignInWithSocialInput = z.infer<typeof signInWithSocialSchema>
