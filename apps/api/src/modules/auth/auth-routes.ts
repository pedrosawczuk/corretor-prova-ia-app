import {
	forgotPasswordSchema,
	resetPasswordSchema,
	revokeSessionSchema,
	signInWithEmailSchema,
	signUpWithEmailSchema,
	updatePasswordSchema,
	updateProfileSchema,
} from '@app/shared'
import type { FastifyInstance } from 'fastify'
import { forgotPasswordModule } from './forgot-password'
import { resetPasswordModule } from './reset-password'
import { revokeOtherSessionsModule } from './revoke-other-sessions'
import { revokeSessionModule } from './revoke-session'
import { signInWithEmailModule } from './sign-in-with-email'
import { signInWithSocialModule } from './sign-in-with-social'
import { signInWithSocialSchema } from './sign-in-with-social-schema'
import { signOutModule } from './sign-out'
import { signUpWithEmailModule } from './sign-up-with-email'
import { updatePasswordModule } from './update-password'
import { updateProfileModule } from './update-profile'

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

	app.post(
		'/forgot-password',
		{
			schema: {
				body: forgotPasswordSchema,
			},
		},
		forgotPasswordModule,
	)

	app.post(
		'/reset-password',
		{
			schema: {
				body: resetPasswordSchema,
			},
		},
		resetPasswordModule,
	)

	app.post('/sign-out', signOutModule)

	app.post(
		'/update-profile',
		{
			schema: {
				body: updateProfileSchema,
			},
		},
		updateProfileModule,
	)

	app.post(
		'/update-password',
		{
			schema: {
				body: updatePasswordSchema,
			},
		},
		updatePasswordModule,
	)

	app.post(
		'/revoke-session',
		{
			schema: {
				body: revokeSessionSchema,
			},
		},
		revokeSessionModule,
	)

	app.post('/revoke-other-sessions', revokeOtherSessionsModule)
}
