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
import { ArrowRight, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'

type RegisterInput = z.infer<typeof signUpWithEmailSchema>

export function CriarContaForm() {
	const router = useRouter()
	const [isLoading, setIsLoading] = React.useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

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
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
			const response = await fetch(`${apiUrl}/auth/sign-up`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					name: data.name,
					email: data.email,
					password: data.password,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				applyApiErrorsToForm(
					errorData,
					form.setError,
					'Ocorreu um erro ao criar sua conta. Tente novamente.',
				)
				return
			}

			toast.success('Conta criada com sucesso! Bem-vindo ao Gabarita.app.')
			router.push('/dashboard')
		} catch {
			toast.error(
				'Não foi possível conectar ao servidor. Verifique sua conexão.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	async function handleGoogleSignUp() {
		setIsGoogleLoading(true)

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
			const response = await fetch(`${apiUrl}/auth/sign-in/social`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					provider: 'google',
					callbackURL: `${window.location.origin}/dashboard`,
				}),
			})

			if (!response.ok) {
				toast.error('Não foi possível iniciar o cadastro com o Google.')
				return
			}

			const data = await response.json().catch(() => ({}))
			if (data.url) {
				window.location.href = data.url
				return
			}

			toast.success('Cadastro realizado com sucesso via Google!')
			router.push('/dashboard')
		} catch {
			toast.error('Erro ao comunicar com o servidor de autenticação.')
		} finally {
			setIsGoogleLoading(false)
		}
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
				onClick={handleGoogleSignUp}
				isLoading={isGoogleLoading}
				className="gap-2.5 font-medium"
			>
				<svg className="size-4.5" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="#EA4335"
						d="M12 5c1.56 0 2.97.54 4.09 1.43l3.05-3.05C17.29 1.63 14.81 1 12 1 7.51 1 3.69 3.56 1.83 7.29l3.65 2.83C6.35 7.15 8.93 5 12 5z"
					/>
					<path
						fill="#4285F4"
						d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.67 2.85c2.14-1.98 3.75-4.89 3.75-8.67z"
					/>
					<path
						fill="#FBBC05"
						d="M5.48 14.88c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.83 7.69C1.06 9.23.63 10.96.63 12.79s.43 3.56 1.2 5.1l3.65-2.83z"
					/>
					<path
						fill="#34A853"
						d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.67-2.85c-1.07.72-2.44 1.16-4.26 1.16-3.07 0-5.65-2.15-6.52-5.12L1.83 16.1C3.69 19.83 7.51 23 12 23z"
					/>
				</svg>
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
