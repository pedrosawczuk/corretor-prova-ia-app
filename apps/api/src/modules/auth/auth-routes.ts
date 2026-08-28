import {
	disableTwoFactorSchema,
	enableTwoFactorSchema,
	forgotPasswordSchema,
	resendVerificationEmailSchema,
	resetPasswordSchema,
	revokeSessionSchema,
	signInWithEmailSchema,
	signUpWithEmailSchema,
	updatePasswordSchema,
	updateProfileSchema,
	verifyEmailQuerySchema,
	verifyTotpSchema,
	verifyTwoFactorOtpSchema,
} from '@app/shared'
import type { FastifyInstance } from 'fastify'
import { disableTwoFactorModule } from './disable-two-factor'
import { enableTwoFactorModule } from './enable-two-factor'
import { forgotPasswordModule } from './forgot-password'
import { resendVerificationEmailModule } from './resend-verification-email'
import { resetPasswordModule } from './reset-password'
import { revokeOtherSessionsModule } from './revoke-other-sessions'
import { revokeSessionModule } from './revoke-session'
import { sendTwoFactorOtpModule } from './send-two-factor-otp'
import { signInWithEmailModule } from './sign-in-with-email'
import { signInWithSocialModule } from './sign-in-with-social'
import { signInWithSocialSchema } from './sign-in-with-social-schema'
import { signOutModule } from './sign-out'
import { signUpWithEmailModule } from './sign-up-with-email'
import { updatePasswordModule } from './update-password'
import { updateProfileModule } from './update-profile'
import { uploadAvatarModule } from './upload-avatar'
import { verifyEmailModule } from './verify-email'
import { verifyTotpModule } from './verify-totp'
import { verifyTwoFactorOtpModule } from './verify-two-factor-otp'

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

	app.post('/upload-avatar', uploadAvatarModule)

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

	app.post(
		'/resend-verification-email',
		{
			schema: {
				body: resendVerificationEmailSchema,
			},
		},
		resendVerificationEmailModule,
	)

	app.get(
		'/verify-email',
		{
			schema: {
				querystring: verifyEmailQuerySchema,
			},
		},
		verifyEmailModule,
	)

	app.post(
		'/two-factor/enable',
		{
			schema: {
				body: enableTwoFactorSchema,
			},
		},
		enableTwoFactorModule,
	)

	app.post(
		'/two-factor/disable',
		{
			schema: {
				body: disableTwoFactorSchema,
			},
		},
		disableTwoFactorModule,
	)

	app.post(
		'/two-factor/verify-totp',
		{
			schema: {
				body: verifyTotpSchema,
			},
		},
		verifyTotpModule,
	)

	app.post('/two-factor/send-otp', sendTwoFactorOtpModule)

	app.post(
		'/two-factor/verify-otp',
		{
			schema: {
				body: verifyTwoFactorOtpSchema,
			},
		},
		verifyTwoFactorOtpModule,
	)
}
