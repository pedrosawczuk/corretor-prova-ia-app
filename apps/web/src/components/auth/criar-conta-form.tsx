'use client'

import { signUpWithEmailSchema } from '@app/shared'
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Separator,
	toast,
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	Lock,
	Mail,
	User,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { useGoogleAuth } from '@/hooks/use-google-auth'
import { apiClient } from '@/lib/api-client'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'
import { GoogleIcon } from './google-icon'

type RegisterInput = z.infer<typeof signUpWithEmailSchema>

export function CriarContaForm() {
	const [isLoading, setIsLoading] = React.useState(false)
	const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(
		null,
	)
	const { isLoading: isGoogleLoading, signInWithGoogle } = useGoogleAuth({
		startErrorMessage: 'Não foi possível iniciar o cadastro com o Google.',
		successMessage: 'Cadastro realizado com sucesso via Google!',
	})

	const form = useForm<RegisterInput>({
		resolver: zodResolver(signUpWithEmailSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	})

	async function onSubmit(data: RegisterInput) {
		setIsLoading(true)

		try {
			await apiClient('/auth/sign-up', {
				method: 'POST',
				body: JSON.stringify({
					name: data.name,
					email: data.email,
					password: data.password,
				}),
			})

			setRegisteredEmail(data.email)
		} catch (error) {
			applyApiErrorsToForm(
				error,
				form.setError,
				'Ocorreu um erro ao criar sua conta. Tente novamente.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	async function handleResend() {
		if (!registeredEmail) return

		setIsLoading(true)

		try {
			await apiClient('/auth/resend-verification-email', {
				method: 'POST',
				body: JSON.stringify({ email: registeredEmail }),
			})

			toast.success('E-mail de confirmação reenviado com sucesso.')
		} catch (error) {
			applyApiErrorsToForm(
				error,
				form.setError,
				'Não foi possível reenviar o e-mail de confirmação. Tente novamente.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	if (registeredEmail) {
		return (
			<div className="w-full space-y-6 text-left">
				<div className="size-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
					<CheckCircle2 className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						Confirme seu e-mail
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Sua conta foi criada! Enviamos um link de confirmação para{' '}
						<strong className="text-foreground">{registeredEmail}</strong>. Abra
						o e-mail e clique no link para ativar sua conta antes de entrar na
						plataforma.
					</p>
				</div>

				<div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
					Não encontrou o e-mail? Confira também a caixa de spam ou{' '}
					<button
						type="button"
						onClick={handleResend}
						disabled={isLoading}
						className="text-primary font-semibold hover:underline cursor-pointer disabled:opacity-50"
					>
						reenvie o link de confirmação
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
					Criar conta gratuita
				</h1>
				<p className="text-sm text-muted-foreground">
					Comece a economizar horas de correção e gerenciar suas turmas com IA.
				</p>
			</div>

			<Button
				type="button"
				variant="outline"
				fullWidth
				size="lg"
				onClick={signInWithGoogle}
				isLoading={isGoogleLoading}
				className="gap-2.5 font-medium"
			>
				<GoogleIcon className="size-4.5" />
				Cadastrar com o Google
			</Button>

			<div className="relative">
				<Separator label="ou cadastre com e-mail" labelAlignment="center" />
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel required leftIcon={<User className="size-3.5" />}>
									Nome Completo
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Prof. Carlos Silva"
										type="text"
										autoComplete="name"
										disabled={isLoading}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel required leftIcon={<Lock className="size-3.5" />}>
									Criar Senha
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Mínimo 8 caracteres"
										type="password"
										autoComplete="new-password"
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
						rightIcon={<ArrowRight className="size-4" />}
						className="mt-2"
					>
						Criar Minha Conta Gratuita
					</Button>
				</form>
			</Form>

			<div className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
				Já possui uma conta?{' '}
				<Link
					href="/entrar"
					className="text-primary font-semibold hover:underline"
				>
					Entrar na plataforma
				</Link>
			</div>
		</div>
	)
}
