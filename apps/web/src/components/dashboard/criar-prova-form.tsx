'use client'

import { type CreateExamInput, createExamSchema } from '@app/shared'
import {
	Button,
	DialogFooter,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Textarea,
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface CriarProvaFormProps {
	classroomId: string
	onSubmit: (data: CreateExamInput) => void
	onCancel: () => void
	isPending: boolean
}

export function CriarProvaForm({
	classroomId,
	onSubmit,
	onCancel,
	isPending,
}: CriarProvaFormProps) {
	const form = useForm<CreateExamInput>({
		resolver: zodResolver(createExamSchema),
		defaultValues: {
			classroomId,
			title: '',
			description: '',
		},
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel required>Nome da prova</FormLabel>
							<FormControl>
								<Input
									placeholder="Avaliação Bimestral — Frações"
									disabled={isPending}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrição (opcional)</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Alguma observação sobre a prova..."
									size="sm"
									showCount
									maxLength={500}
									disabled={isPending}
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
						onClick={onCancel}
						disabled={isPending}
					>
						Cancelar
					</Button>
					<Button type="submit" isLoading={isPending}>
						Criar prova
					</Button>
				</DialogFooter>
			</form>
		</Form>
	)
}
