'use client'

import {
	type CreatePrivilegedEmailInput,
	createPrivilegedEmailSchema,
} from '@app/shared'
import {
	Button,
	Dialog,
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
import { Plus, Star } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useCreatePrivilegedEmail } from '@/hooks/use-admin-access-grants'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'

export function AdicionarEmailPrivilegiadoDialog() {
	const [open, setOpen] = React.useState(false)
	const createPrivilegedEmail = useCreatePrivilegedEmail()

	const form = useForm<CreatePrivilegedEmailInput>({
		resolver: zodResolver(createPrivilegedEmailSchema),
		defaultValues: { email: '', note: '' },
	})

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen)
		if (!nextOpen) form.reset()
	}

	function onSubmit(data: CreatePrivilegedEmailInput) {
		createPrivilegedEmail.mutate(data, {
			onSuccess: () => {
				toast.success(`${data.email} adicionado aos privilegiados.`)
				handleOpenChange(false)
			},
			onError: (error) => {
				applyApiErrorsToForm(
					error,
					form.setError,
					'Não foi possível adicionar o e-mail. Tente novamente.',
				)
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" leftIcon={<Plus />}>
					Adicionar e-mail
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Star className="size-5 text-primary" />
						Adicionar e-mail privilegiado
					</DialogTitle>
					<DialogDescription>
						Quando este e-mail entrar no Corrige Go, ganha 3 meses do plano Pro
						automaticamente. Nenhum e-mail é enviado.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>E-mail</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="parceiro@escola.com"
											disabled={createPrivilegedEmail.isPending}
											autoFocus
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="note"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Observação</FormLabel>
									<FormControl>
										<Input
											placeholder="Ex.: beta tester, parceiro da escola X"
											disabled={createPrivilegedEmail.isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={createPrivilegedEmail.isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" isLoading={createPrivilegedEmail.isPending}>
								Adicionar
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
