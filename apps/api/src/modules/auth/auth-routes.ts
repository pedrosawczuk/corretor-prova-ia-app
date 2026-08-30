import {
	deleteAccountSchema,
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
import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { deleteAccountModule } from './delete-account'
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

function strictRateLimit(max: number): RouteShorthandOptions['config'] {
	return { rateLimit: { max, timeWindow: '1 minute', ban: 3 } }
}

export function authRoutes(app: FastifyInstance) {
	app.post(
		'/sign-up',
		{
			schema: { body: signUpWithEmailSchema },
			config: strictRateLimit(5),
		},
		signUpWithEmailModule,
	)

	app.post(
		'/sign-in',
		{
			schema: { body: signInWithEmailSchema },
			config: strictRateLimit(8),
		},
		signInWithEmailModule,
	)

	app.post(
		'/sign-in/social',
		{
			schema: { body: signInWithSocialSchema },
			config: strictRateLimit(15),
		},
		signInWithSocialModule,
	)

	app.post(
		'/forgot-password',
		{
			schema: { body: forgotPasswordSchema },
			config: strictRateLimit(5),
		},
		forgotPasswordModule,
	)

	app.post(
		'/reset-password',
		{
			schema: { body: resetPasswordSchema },
			config: strictRateLimit(8),
		},
		resetPasswordModule,
	)

	app.post('/sign-out', signOutModule)

	app.post(
		'/update-profile',
		{
			schema: { body: updateProfileSchema },
		},
		updateProfileModule,
	)

	app.post(
		'/upload-avatar',
		{ config: strictRateLimit(15) },
		uploadAvatarModule,
	)

	app.post(
		'/update-password',
		{
			schema: { body: updatePasswordSchema },
			config: strictRateLimit(5),
		},
		updatePasswordModule,
	)

	app.post(
		'/revoke-session',
		{
			schema: { body: revokeSessionSchema },
		},
		revokeSessionModule,
	)

	app.post('/revoke-other-sessions', revokeOtherSessionsModule)

	app.post(
		'/resend-verification-email',
		{
			schema: { body: resendVerificationEmailSchema },
			config: strictRateLimit(3),
		},
		resendVerificationEmailModule,
	)

	app.get(
		'/verify-email',
		{
			schema: { querystring: verifyEmailQuerySchema },
			config: strictRateLimit(15),
		},
		verifyEmailModule,
	)

	app.post(
		'/two-factor/enable',
		{
			schema: { body: enableTwoFactorSchema },
			config: strictRateLimit(5),
		},
		enableTwoFactorModule,
	)

	app.post(
		'/two-factor/disable',
		{
			schema: { body: disableTwoFactorSchema },
			config: strictRateLimit(5),
		},
		disableTwoFactorModule,
	)

	app.post(
		'/two-factor/verify-totp',
		{
			schema: { body: verifyTotpSchema },
			config: strictRateLimit(5),
		},
		verifyTotpModule,
	)

	app.post(
		'/two-factor/send-otp',
		{ config: strictRateLimit(3) },
		sendTwoFactorOtpModule,
	)

	app.post(
		'/two-factor/verify-otp',
		{
			schema: { body: verifyTwoFactorOtpSchema },
			config: strictRateLimit(5),
		},
		verifyTwoFactorOtpModule,
	)

	app.post(
		'/delete-account',
		{
			schema: { body: deleteAccountSchema },
			config: strictRateLimit(3),
		},
		deleteAccountModule,
	)
}
