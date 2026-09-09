import { env } from '@app/env'
import { Resend } from 'resend'
import { NewLoginEmail } from './templates/new-login-email'
import { PaymentFailedEmail } from './templates/payment-failed-email'
import { PaymentReceivedEmail } from './templates/payment-received-email'
import { ResetPasswordEmail } from './templates/reset-password-email'
import { SubscriptionCancelledEmail } from './templates/subscription-cancelled-email'
import { TwoFactorOtpEmail } from './templates/two-factor-otp-email'
import { VerifyEmail } from './templates/verify-email'
import { WelcomeEmail } from './templates/welcome-email'

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

interface SendVerificationEmailParams {
	to: string
	name: string
	verificationUrl: string
}

export async function sendVerificationEmail({
	to,
	name,
	verificationUrl,
}: SendVerificationEmailParams) {
	if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
		return
	}

	await resend.emails.send({
		from: env.MAIL_FROM,
		to,
		subject: 'Confirme seu e-mail — gabarita.app',
		react: VerifyEmail({ name, verificationUrl }),
	})
}

interface SendTwoFactorOtpEmailParams {
	to: string
	name: string
	otp: string
}

export async function sendTwoFactorOtpEmail({
	to,
	name,
	otp,
}: SendTwoFactorOtpEmailParams) {
	if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
		return
	}

	await resend.emails.send({
		from: env.MAIL_FROM,
		to,
		subject: 'Seu código de verificação — gabarita.app',
		react: TwoFactorOtpEmail({ name, otp }),
	})
}

interface SendNewLoginEmailParams {
	to: string
	name: string
	device: string
	ipAddress: string
	dateTime: string
	securityUrl: string
}

export async function sendNewLoginEmail({
	to,
	name,
	device,
	ipAddress,
	dateTime,
	securityUrl,
}: SendNewLoginEmailParams) {
	if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
		return
	}

	await resend.emails.send({
		from: env.MAIL_FROM,
		to,
		subject: 'Novo login detectado — gabarita.app',
		react: NewLoginEmail({ name, device, ipAddress, dateTime, securityUrl }),
	})
}

interface SendPaymentFailedEmailParams {
	to: string
	name: string
}

export async function sendPaymentFailedEmail({
	to,
	name,
}: SendPaymentFailedEmailParams) {
	if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
		return
	}

	await resend.emails.send({
		from: env.MAIL_FROM,
		to,
		subject: 'Não conseguimos confirmar seu pagamento — gabarita.app',
		react: PaymentFailedEmail({
			name,
			manageUrl: `${env.WEB_URL}/dashboard/configuracoes`,
		}),
	})
}

interface SendPaymentReceivedEmailParams {
	to: string
	name: string
	planName: string
	priceCents: number
}

export async function sendPaymentReceivedEmail({
	to,
	name,
	planName,
	priceCents,
}: SendPaymentReceivedEmailParams) {
	if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
		return
	}

	const priceFormatted = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(priceCents / 100)

	await resend.emails.send({
		from: env.MAIL_FROM,
		to,
		subject: 'Pagamento confirmado — gabarita.app',
		react: PaymentReceivedEmail({
			name,
			planName,
			priceFormatted,
			dashboardUrl: `${env.WEB_URL}/dashboard`,
		}),
	})
}

interface SendSubscriptionCancelledEmailParams {
	to: string
	name: string
}

export async function sendSubscriptionCancelledEmail({
	to,
	name,
}: SendSubscriptionCancelledEmailParams) {
	if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
		return
	}

	await resend.emails.send({
		from: env.MAIL_FROM,
		to,
		subject: 'Sua assinatura foi cancelada — gabarita.app',
		react: SubscriptionCancelledEmail({
			name,
			manageUrl: `${env.WEB_URL}/dashboard/configuracoes`,
		}),
	})
}
