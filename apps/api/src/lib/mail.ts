import { env } from '@app/env'
import { Resend } from 'resend'
import { ResetPasswordEmail } from './mail/templates/reset-password-email'
import { WelcomeEmail } from './mail/templates/welcome-email'

export const resend = new Resend(env.RESEND_API_KEY)

interface SendWelcomeEmailParams {
	to: string
	name: string
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
	if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
		return
	}

	await resend.emails.send({
		from: env.MAIL_FROM,
		to,
		subject: 'Bem-vindo ao gabarita.app! 🚀',
		react: WelcomeEmail({ name, dashboardUrl: `${env.WEB_URL}/dashboard` }),
	})
}

interface SendPasswordResetEmailParams {
	to: string
	name: string
	resetUrl: string
}

export async function sendPasswordResetEmail({
	to,
	name,
	resetUrl,
}: SendPasswordResetEmailParams) {
	if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
		return
	}

	await resend.emails.send({
		from: env.MAIL_FROM,
		to,
		subject: 'Redefinir sua senha — gabarita.app',
		react: ResetPasswordEmail({ name, resetUrl }),
	})
}
