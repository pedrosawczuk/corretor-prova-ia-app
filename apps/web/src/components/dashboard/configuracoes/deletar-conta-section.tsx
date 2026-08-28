'use client'

import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { AlertTriangle, Mail, Trash2 } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'
import type { AuthUser } from '@/lib/auth-server'

interface DeletarContaSectionProps {
	user: AuthUser
}

export function DeletarContaSection({ user }: DeletarContaSectionProps) {
	const [isOpen, setIsOpen] = React.useState(false)
	const [isLoading, setIsLoading] = React.useState(false)

	const confirmDeleteSchema = React.useMemo(
		() =>
			z.object({
				email: z
					.string()
					.min(1, 'Digite seu e-mail para confirmar')
					.email('E-mail inválido')
					.refine(
						(val) => val.trim().toLowerCase() === user.email.toLowerCase(),
						{
							message:
								'O e-mail digitado não corresponde ao seu e-mail cadastrado.',
						},
					),
			}),
		[user.email],
	)

	type ConfirmDeleteInput = z.infer<typeof confirmDeleteSchema>

	const form = useForm<ConfirmDeleteInput>({
		resolver: zodResolver(confirmDeleteSchema),
		defaultValues: {
			email: '',
		},
	})

	async function onSubmit(data: ConfirmDeleteInput) {
		setIsLoading(true)

		try {
			await apiClient('/auth/delete-account', {
				method: 'POST',
				body: JSON.stringify({ email: data.email }),
			})

			toast.success('Sua conta foi excluída com sucesso.')
			setIsOpen(false)
			form.reset()

			window.location.href = '/entrar'
		} catch (error) {
			applyApiErrorsToForm(
				error,
				form.setError,
				'Não foi possível excluir sua conta. Tente novamente.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	function handleOpenChange(open: boolean) {
		if (isLoading) return
		setIsOpen(open)
		if (!open) {
			form.reset()
		}
	}

	return (
		<Card className="border-destructive/30">
			<CardHeader className="flex-row items-center gap-3 space-y-0">
				<div className="size-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
					<Trash2 className="size-4.5" />
				</div>
				<div>
					<CardTitle className="text-base text-destructive">
						Deletar Conta
					</CardTitle>
					<p className="text-xs text-muted-foreground mt-0.5">
						Ações destrutivas e exclusão permanente da sua conta de docente.
					</p>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-muted-foreground space-y-2">
					<div className="flex items-center gap-2 text-destructive font-medium">
						<AlertTriangle className="size-4 shrink-0" />
						<span>Atenção: Esta ação é definitiva e irreversível</span>
					</div>
					<p className="leading-relaxed">
						Ao excluir sua conta, todas as suas turmas, provas geradas,
						gabaritos, questões cadastradas e histórico completo de correções
						com IA serão apagados permanentemente dos nossos servidores.
					</p>
				</div>

				<div className="flex justify-end pt-2">
					<Dialog open={isOpen} onOpenChange={handleOpenChange}>
						<DialogTrigger asChild>
							<Button
								variant="destructive"
								leftIcon={<Trash2 className="size-4" />}
							>
								Deletar Conta
							</Button>
						</DialogTrigger>

						<DialogContent size="default">
							<DialogHeader>
								<div className="flex items-center gap-3">
									<div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
										<AlertTriangle className="size-5" />
									</div>
									<div>
										<DialogTitle className="text-base sm:text-lg">
											Excluir conta permanentemente
										</DialogTitle>
										<DialogDescription className="text-xs sm:text-sm">
											Esta ação não pode ser desfeita.
										</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							<div className="space-y-4 py-2">
								<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
									Todas as informações vinculadas ao seu usuário serão perdidas.
									Para confirmar a exclusão da sua conta, digite o seu endereço
									de e-mail (
									<strong className="text-foreground">{user.email}</strong>) no
									campo abaixo:
								</p>

								<Form {...form}>
									<form
										id="delete-account-form"
										onSubmit={form.handleSubmit(onSubmit)}
										className="space-y-4"
									>
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel
														required
														leftIcon={<Mail className="size-3.5" />}
													>
														Confirmar E-mail
													</FormLabel>
													<FormControl>
														<Input
															placeholder={user.email}
															type="email"
															autoComplete="off"
															disabled={isLoading}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</form>
								</Form>
							</div>

							<DialogFooter className="gap-2">
								<DialogClose asChild>
									<Button type="button" variant="outline" disabled={isLoading}>
										Cancelar
									</Button>
								</DialogClose>
								<Button
									type="submit"
									form="delete-account-form"
									variant="destructive"
									isLoading={isLoading}
									leftIcon={<Trash2 className="size-4" />}
								>
									Confirmar Exclusão
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardContent>
		</Card>
	)
}
