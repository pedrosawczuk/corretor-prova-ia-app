'use client'

import { resetPasswordSchema } from '@app/shared'
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	toast,
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, KeyRound, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'

const redefinirSenhaSchema = resetPasswordSchema
	.extend({
		confirmPassword: z.string().min(8, 'Confirme sua nova senha'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'As senhas não coincidem',
		path: ['confirmPassword'],
	})

type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>

interface RedefinirSenhaFormProps {
	token?: string
}

export function RedefinirSenhaForm({ token }: RedefinirSenhaFormProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = React.useState(false)
	const [isDone, setIsDone] = React.useState(false)

	const form = useForm<RedefinirSenhaInput>({
		resolver: zodResolver(redefinirSenhaSchema),
		defaultValues: {
			token: token ?? '',
			password: '',
			confirmPassword: '',
		},
	})

	async function onSubmit(data: RedefinirSenhaInput) {
		setIsLoading(true)

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
			const response = await fetch(`${apiUrl}/auth/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					token: data.token,
					password: data.password,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				applyApiErrorsToForm(
					errorData,
					form.setError,
					'Não foi possível redefinir sua senha. Tente novamente.',
				)
				return
			}

			setIsDone(true)
		} catch {
			toast.error(
				'Não foi possível conectar ao servidor. Verifique sua conexão.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	if (!token) {
		return (
			<div className="w-full space-y-6 text-left">
				<div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
					<KeyRound className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						Link inválido
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Este link de redefinição de senha é inválido ou está incompleto.
						Solicite um novo link para continuar.
					</p>
				</div>

				<Button variant="default" fullWidth size="lg" asChild>
					<Link href="/recuperar-senha">Solicitar novo link</Link>
				</Button>
			</div>
		)
	}

	if (isDone) {
		return (
			<div className="w-full space-y-6 text-left">
				<div className="size-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
					<CheckCircle2 className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						Senha redefinida!
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Sua senha foi alterada com sucesso. Entre na plataforma usando sua
						nova senha.
					</p>
				</div>

				<Button
					variant="default"
					fullWidth
					size="lg"
					onClick={() => router.push('/entrar')}
				>
					Ir para o login
				</Button>
			</div>
		)
	}

	return (
		<div className="w-full space-y-6">
			<div className="space-y-2 text-left">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
					Criar nova senha
				</h1>
				<p className="text-sm text-muted-foreground">
					Escolha uma nova senha para acessar sua conta.
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel required leftIcon={<Lock className="size-3.5" />}>
									Nova senha
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

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel required leftIcon={<Lock className="size-3.5" />}>
									Confirmar nova senha
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Repita a nova senha"
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
						className="mt-2"
					>
						Redefinir senha
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
