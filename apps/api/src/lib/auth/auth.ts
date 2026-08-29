import dayjs from '@app/dayjs'
import { db, eq, user as userTable } from '@app/db'
import { env } from '@app/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins'
import {
	sendNewLoginEmail,
	sendPasswordResetEmail,
	sendTwoFactorOtpEmail,
	sendVerificationEmail,
} from '../mail/mail'
import { parseUserAgent } from './parse-user-agent'

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail({
				to: user.email,
				name: user.name,
				resetUrl: url,
			})
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail({
				to: user.email,
				name: user.name,
				verificationUrl: url,
			})
		},
	},
	user: {
		additionalFields: {
			phoneNumber: {
				type: 'string',
				required: false,
				input: true,
			},
		},
	},
	onAPIError: {
		errorURL: `${env.WEB_URL}/erro-autenticacao`,
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID || '',
			clientSecret: env.GOOGLE_CLIENT_SECRET || '',
		},
	},
	plugins: [
		twoFactor({
			issuer: 'gabarita.app',
			otpOptions: {
				sendOTP: async ({ user, otp }) => {
					await sendTwoFactorOtpEmail({
						to: user.email,
						name: user.name,
						otp,
					})
				},
			},
		}),
	],
	databaseHooks: {
		session: {
			create: {
				after: async (session) => {
					const [loggedInUser] = await db
						.select()
						.from(userTable)
						.where(eq(userTable.id, session.userId))

					if (!loggedInUser) return

					sendNewLoginEmail({
						to: loggedInUser.email,
						name: loggedInUser.name,
						device: parseUserAgent(session.userAgent),
						ipAddress: session.ipAddress || 'IP desconhecido',
						dateTime: dayjs(session.createdAt).format('DD/MM/YYYY [às] HH:mm'),
						securityUrl: `${env.WEB_URL}/dashboard/configuracoes`,
					})
				},
			},
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [env.WEB_URL],
})
