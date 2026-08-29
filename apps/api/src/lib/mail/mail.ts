import { env } from '@app/env'
import { Resend } from 'resend'
import { NewLoginEmail } from './templates/new-login-email'
import { ResetPasswordEmail } from './templates/reset-password-email'
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
