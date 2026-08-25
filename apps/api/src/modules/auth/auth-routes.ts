import type { FastifyInstance } from 'fastify'
import { signInWithEmailModule } from './sign-in-with-email'
import { signInWithEmailSchema } from './sign-in-with-email-schema'
import { signInWithSocialModule } from './sign-in-with-social'
import { signInWithSocialSchema } from './sign-in-with-social-schema'
import { signUpWithEmailModule } from './sign-up-with-email'
import { signUpWithEmailSchema } from './sign-up-with-email-schema'

export function authRoutes(app: FastifyInstance) {
	app.post(
		'/sign-up',
		{
			schema: {
				body: signUpWithEmailSchema,
			},
		},
		signUpWithEmailModule,
	)

	app.post(
		'/sign-in',
		{
			schema: {
				body: signInWithEmailSchema,
			},
		},
		signInWithEmailModule,
	)

	app.post(
		'/sign-in/social',
		{
			schema: {
				body: signInWithSocialSchema,
			},
		},
		signInWithSocialModule,
	)
}
