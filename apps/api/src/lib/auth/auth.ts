import dayjs from '@app/dayjs'
import { db, eq, session as sessionTable, user as userTable } from '@app/db'
import { env } from '@app/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { admin, twoFactor } from 'better-auth/plugins'
import { claimAccessGrant } from '@/modules/access-grants/claim-access-grant'
import {
	sendDeleteAccountVerificationEmail,
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
		revokeSessionsOnPasswordReset: true,
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
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url }) => {
				await sendDeleteAccountVerificationEmail({
					to: user.email,
					name: user.name,
					verificationUrl: url,
				})
			},
		},
		additionalFields: {
			phoneNumber: {
				type: 'string',
				required: false,
				input: true,
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		freshAge: 60 * 30,
		additionalFields: {
			twoFactorVerifiedAt: {
				type: 'date',
				required: false,
				input: false,
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
	account: {
		encryptOAuthTokens: true,
	},
	plugins: [
		admin({
			defaultRole: 'user',
			adminRoles: ['admin'],
		}),
		twoFactor({
			issuer: 'Corrige Go',
			allowPasswordless: true,
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
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (
				ctx.path === '/two-factor/verify-totp' ||
				ctx.path === '/two-factor/verify-otp' ||
				ctx.path === '/two-factor/verify-backup-code'
			) {
				if (ctx.context.returned instanceof Error) {
					return
				}

				const verifiedSession =
					ctx.context.newSession?.session ?? ctx.context.session?.session

				if (verifiedSession?.id) {
					await db
						.update(sessionTable)
						.set({ twoFactorVerifiedAt: new Date() })
						.where(eq(sessionTable.id, verifiedSession.id))
				}
			}
		}),
	},
	databaseHooks: {
		session: {
			create: {
				after: async (session) => {
					const [loggedInUser] = await db
						.select()
						.from(userTable)
						.where(eq(userTable.id, session.userId))

					if (!loggedInUser) return

					await claimAccessGrant(loggedInUser.id).catch((error) => {
						console.error(
							'[access grants] Falha ao aplicar cortesia no login.',
							{
								userId: loggedInUser.id,
								error,
							},
						)
					})

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
