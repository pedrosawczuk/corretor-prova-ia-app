import dayjs from '@app/dayjs'
import { db, eq, user as userTable } from '@app/db'
import { env } from '@app/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { sendNewLoginEmail, sendPasswordResetEmail } from './mail'
import { parseUserAgent } from './parse-user-agent'

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
	}),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail({
				to: user.email,
				name: user.name,
				resetUrl: url,
			})
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID || '',
			clientSecret: env.GOOGLE_CLIENT_SECRET || '',
		},
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
