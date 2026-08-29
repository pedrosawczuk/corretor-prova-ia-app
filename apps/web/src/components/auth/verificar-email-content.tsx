'use client'

import { resendVerificationEmailSchema } from '@app/shared'
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	ArrowLeft,
	CheckCircle2,
	LayoutDashboard,
	Mail,
	MailWarning,
	SendHorizonal,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'

type ResendVerificationInput = z.infer<typeof resendVerificationEmailSchema>

const ERROR_MESSAGES: Record<string, string> = {
	EMAIL_NOT_VERIFIED:
		'Você ainda não confirmou seu e-mail. Solicite um novo link de confirmação abaixo.',
	TOKEN_EXPIRED:
		'Este link de confirmação expirou. Solicite um novo abaixo para ativar sua conta.',
	INVALID_TOKEN:
		'Este link de confirmação é inválido ou já foi utilizado. Solicite um novo abaixo.',
	USER_NOT_FOUND:
		'Não encontramos uma conta para este link. Solicite um novo abaixo.',
	INVALID_USER:
		'Este link de confirmação não é válido para a sua sessão atual. Solicite um novo abaixo.',
}

const DEFAULT_ERROR_MESSAGE =
	'Não foi possível confirmar seu e-mail. Solicite um novo link abaixo.'

interface VerificarEmailContentProps {
	error?: string
	email?: string
}

export function VerificarEmailContent({
	error,
	email,
}: VerificarEmailContentProps) {
	const [isLoading, setIsLoading] = React.useState(false)
	const [resent, setResent] = React.useState(false)

	const form = useForm<ResendVerificationInput>({
		resolver: zodResolver(resendVerificationEmailSchema),
		defaultValues: {
			email: email ?? '',
		},
	})

	async function onSubmit(data: ResendVerificationInput) {
		setIsLoading(true)

		try {
			await apiClient('/auth/resend-verification-email', {
				method: 'POST',
				body: JSON.stringify({ email: data.email }),
			})

			setResent(true)
		} catch (submitError) {
			applyApiErrorsToForm(
				submitError,
				form.setError,
				'Não foi possível reenviar o e-mail de confirmação. Tente novamente.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	if (!error) {
		return (
			<div className="w-full space-y-6 text-left">
				<div className="size-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
					<CheckCircle2 className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						E-mail confirmado!
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Sua conta foi ativada com sucesso. Agora você já pode acessar a
						plataforma.
					</p>
				</div>

				<Button
					variant="default"
					fullWidth
					size="lg"
					rightIcon={<LayoutDashboard className="size-4" />}
					asChild
				>
					<Link href="/dashboard">Ir para o Dashboard</Link>
				</Button>
			</div>
		)
	}

	if (resent) {
		return (
			<div className="w-full space-y-6 text-left">
				<div className="size-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
					<CheckCircle2 className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						Novo e-mail enviado!
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Enviamos um novo link de confirmação para{' '}
						<strong className="text-foreground">
							{form.getValues('email')}
						</strong>
						. Verifique sua caixa de entrada (e a pasta de spam) para ativar sua
						conta.
					</p>
				</div>

				<Button variant="outline" fullWidth size="lg" asChild>
					<Link href="/entrar">
						<ArrowLeft />
						Voltar para o login
					</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="w-full space-y-6 text-left">
			<div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
				<MailWarning className="size-6" />
			</div>

			<div className="space-y-2">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
					Não foi possível confirmar
				</h1>
				<p className="text-sm text-muted-foreground leading-relaxed">
					{ERROR_MESSAGES[error] ?? DEFAULT_ERROR_MESSAGE}
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel required leftIcon={<Mail className="size-3.5" />}>
									E-mail do Docente
								</FormLabel>
								<FormControl>
									<Input
										placeholder="professor@escola.edu.br"
										type="email"
										autoComplete="email"
										disabled={isLoading}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						variant="default"
						size="lg"
						fullWidth
						isLoading={isLoading}
						rightIcon={<SendHorizonal className="size-4" />}
						className="mt-2"
					>
						Reenviar E-mail de Confirmação
					</Button>
				</form>
			</Form>

			<div className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
				<Link
					href="/entrar"
					className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
				>
					<ArrowLeft className="size-3.5" />
					Voltar para o login
				</Link>
			</div>
		</div>
	)
}
