'use client'

import { type CreateInviteInput, createInviteSchema } from '@app/shared'
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
import { MailPlus, Send } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useCreateInvite } from '@/hooks/use-admin-access-grants'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'

export function ConvidarProfessorDialog() {
	const [open, setOpen] = React.useState(false)
	const createInvite = useCreateInvite()

	const form = useForm<CreateInviteInput>({
		resolver: zodResolver(createInviteSchema),
		defaultValues: { email: '' },
	})

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen)
		if (!nextOpen) form.reset()
	}

	function onSubmit(data: CreateInviteInput) {
		createInvite.mutate(data, {
			onSuccess: () => {
				toast.success(`Convite enviado para ${data.email}.`)
				handleOpenChange(false)
			},
			onError: (error) => {
				applyApiErrorsToForm(
					error,
					form.setError,
					'Não foi possível enviar o convite. Tente novamente.',
				)
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" leftIcon={<MailPlus />}>
					Convidar professor
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Send className="size-5 text-primary" />
						Convidar professor
					</DialogTitle>
					<DialogDescription>
						O professor recebe um link por e-mail, válido por 14 dias. Ao criar
						a conta com este e-mail, ganha 3 meses do plano Pro.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>E-mail do professor</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="professor@escola.com"
											disabled={createInvite.isPending}
											autoFocus
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
								disabled={createInvite.isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" isLoading={createInvite.isPending}>
								Enviar convite
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
