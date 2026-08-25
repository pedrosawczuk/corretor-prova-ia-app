import { env } from '@app/env'
import { Resend } from 'resend'
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
		subject: 'Bem-vindo ao Corretor de Prova IA! 🚀',
		react: WelcomeEmail({ name }),
	})
}
