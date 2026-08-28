'use client'

import { changePasswordSchema } from '@app/shared'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
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
import { KeyRound, ShieldCheck } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'

type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export function SegurancaSection() {
	const [isLoading, setIsLoading] = React.useState(false)

	const form = useForm<ChangePasswordInput>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	async function onSubmit(data: ChangePasswordInput) {
		setIsLoading(true)

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
			const response = await fetch(`${apiUrl}/auth/update-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					currentPassword: data.currentPassword,
					newPassword: data.newPassword,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))

				if (errorData.code === 'INVALID_PASSWORD') {
					form.setError('currentPassword', {
						type: 'manual',
						message: 'Senha atual incorreta.',
					})
					toast.error('Senha atual incorreta.')
					return
				}

				if (errorData.code === 'SESSION_NOT_FRESH') {
					toast.error(
						'Por segurança, faça login novamente para alterar sua senha.',
					)
					return
				}

				applyApiErrorsToForm(
					errorData,
					form.setError,
					'Não foi possível alterar sua senha. Tente novamente.',
				)
				return
			}

			toast.success(
				'Senha alterada com sucesso! Suas outras sessões foram encerradas.',
			)
			form.reset()
		} catch {
			toast.error(
				'Não foi possível conectar ao servidor. Verifique sua conexão.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Card>
			<CardHeader className="flex-row items-center gap-3 space-y-0">
				<div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
					<ShieldCheck className="size-4.5" />
				</div>
				<div>
					<CardTitle className="text-base">Segurança</CardTitle>
					<p className="text-xs text-muted-foreground mt-0.5">
						Altere sua senha de acesso à plataforma.
					</p>
				</div>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="currentPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel
										required
										leftIcon={<KeyRound className="size-3.5" />}
									>
										Senha Atual
									</FormLabel>
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

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel
											required
											leftIcon={<KeyRound className="size-3.5" />}
										>
											Nova Senha
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Mínimo 6 caracteres"
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
										<FormLabel
											required
											leftIcon={<KeyRound className="size-3.5" />}
										>
											Confirmar Nova Senha
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
						</div>

						<p className="text-xs text-muted-foreground leading-relaxed">
							Ao alterar sua senha, todas as suas outras sessões ativas serão
							encerradas por segurança.
						</p>

						<div className="flex justify-end pt-2">
							<Button
								type="submit"
								variant="default"
								isLoading={isLoading}
								leftIcon={<KeyRound className="size-4" />}
							>
								Alterar Senha
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
