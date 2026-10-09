'use client'

import { taxIdSchema } from '@app/shared'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatCpfCnpj } from './informar-documento-dialog.utils'

const informarDocumentoSchema = z.object({ cpfCnpj: taxIdSchema })

type InformarDocumentoInput = z.input<typeof informarDocumentoSchema>
type InformarDocumentoOutput = z.output<typeof informarDocumentoSchema>

interface InformarDocumentoDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (cpfCnpj: string) => void
	isPending: boolean
}

export function InformarDocumentoDialog({
	open,
	onOpenChange,
	onSubmit,
	isPending,
}: InformarDocumentoDialogProps) {
	const form = useForm<
		InformarDocumentoInput,
		unknown,
		InformarDocumentoOutput
	>({
		resolver: zodResolver(informarDocumentoSchema),
		defaultValues: { cpfCnpj: '' },
	})

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			form.reset()
		}
		onOpenChange(nextOpen)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Informe seu CPF ou CNPJ</DialogTitle>
					<DialogDescription>
						O documento é exigido pelo processador de pagamentos (Asaas) para
						emitir a cobrança. Ele é enviado direto ao Asaas e não fica
						armazenado no Corretor.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(({ cpfCnpj }) => onSubmit(cpfCnpj))}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="cpfCnpj"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>CPF ou CNPJ</FormLabel>
									<FormControl>
										<Input
											placeholder="000.000.000-00"
											inputMode="numeric"
											autoComplete="off"
											autoFocus
											disabled={isPending}
											{...field}
											onChange={(event) =>
												field.onChange(formatCpfCnpj(event.target.value))
											}
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
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" isLoading={isPending}>
								Continuar para pagamento
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
