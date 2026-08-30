'use client'

import { signInWithEmailSchema } from '@app/shared'
import {
	Button,
	Checkbox,
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
import { ArrowRight, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useGoogleAuth } from '@/hooks/use-google-auth'
import { ApiError, apiClient } from '@/lib/api-client'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'
import { GoogleIcon } from './google-icon'

const entrarSchema = signInWithEmailSchema.extend({
	remember: z.boolean(),
})

type EntrarInput = z.infer<typeof entrarSchema>

export function EntrarForm() {
	const router = useRouter()
	const [isLoading, setIsLoading] = React.useState(false)
	const { isLoading: isGoogleLoading, signInWithGoogle } = useGoogleAuth({
		startErrorMessage: 'Não foi possível iniciar a autenticação com o Google.',
		successMessage: 'Autenticado com sucesso via Google!',
	})

	const form = useForm<EntrarInput>({
		resolver: zodResolver(entrarSchema),
		defaultValues: {
			email: '',
			password: '',
			remember: false,
		},
	})

	async function onSubmit(data: EntrarInput) {
		setIsLoading(true)

		try {
			await apiClient('/auth/sign-in', {
				method: 'POST',
				body: JSON.stringify({
					email: data.email,
					password: data.password,
				}),
			})

			toast.success('Bem-vindo de volta ao Gabarita.app!')
			window.location.href = '/dashboard'
		} catch (error) {
			if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
				router.push(
					`/verificar-email?error=EMAIL_NOT_VERIFIED&email=${encodeURIComponent(data.email)}`,
				)
				return
			}

			applyApiErrorsToForm(
				error,
				form.setError,
				'E-mail ou senha incorretos. Tente novamente.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full space-y-6">
			<div className="space-y-2 text-left">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
					Entrar na plataforma
				</h1>
				<p className="text-sm text-muted-foreground">
					Acesse suas turmas, provas geradas e histórico de correções.
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
				Continuar com o Google
			</Button>

			<div className="relative">
				<Separator label="ou entre com e-mail" labelAlignment="center" />
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

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel required leftIcon={<Lock className="size-3.5" />}>
										Senha
									</FormLabel>
									<Link
										href="/recuperar-senha"
										className="text-xs text-primary hover:underline font-medium"
									>
										Esqueceu a senha?
									</Link>
								</div>
								<FormControl>
									<Input
										placeholder="••••••••"
										type="password"
										autoComplete="current-password"
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
						name="remember"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Checkbox
										label="Lembrar deste dispositivo por 30 dias"
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isLoading}
									/>
								</FormControl>
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
						Entrar na Plataforma
					</Button>
				</form>
			</Form>

			<div className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
				Ainda não tem uma conta?{' '}
				<Link
					href="/criar-conta"
					className="text-primary font-semibold hover:underline"
				>
					Cadastre-se gratuitamente
				</Link>
			</div>
		</div>
	)
}
