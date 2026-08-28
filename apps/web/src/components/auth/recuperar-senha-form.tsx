'use client'

import { forgotPasswordSchema } from '@app/shared'
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
import { ArrowLeft, CheckCircle2, Mail, SendHorizonal } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export function RecuperarSenhaForm() {
	const [isLoading, setIsLoading] = React.useState(false)
	const [sentTo, setSentTo] = React.useState<string | null>(null)

	const form = useForm<ForgotPasswordInput>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	})

	async function onSubmit(data: ForgotPasswordInput) {
		setIsLoading(true)

		try {
			await apiClient('/auth/forgot-password', {
				method: 'POST',
				body: JSON.stringify({
					email: data.email,
				}),
			})

			setSentTo(data.email)
		} catch (error) {
			applyApiErrorsToForm(
				error,
				form.setError,
				'Não foi possível enviar o link de recuperação. Tente novamente.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	if (sentTo) {
		return (
			<div className="w-full space-y-6 text-left">
				<div className="size-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
					<CheckCircle2 className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						Verifique seu e-mail
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Enviamos um link de recuperação de senha para{' '}
						<strong className="text-foreground">{sentTo}</strong>. Clique no
						link recebido para criar uma nova senha.
					</p>
				</div>

				<div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
					Não encontrou o e-mail? Confira também a caixa de spam ou{' '}
					<button
						type="button"
						onClick={() => setSentTo(null)}
						className="text-primary font-semibold hover:underline cursor-pointer"
					>
						tente enviar novamente
					</button>
					.
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
		<div className="w-full space-y-6">
			<div className="space-y-2 text-left">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
					Recuperar senha
				</h1>
				<p className="text-sm text-muted-foreground">
					Informe o e-mail cadastrado e enviaremos um link para você criar uma
					nova senha.
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
						Enviar Link de Recuperação
					</Button>
				</form>
			</Form>

			<div className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
				Lembrou sua senha?{' '}
				<Link
					href="/entrar"
					className="text-primary font-semibold hover:underline"
				>
					Voltar para o login
				</Link>
			</div>
		</div>
	)
}
