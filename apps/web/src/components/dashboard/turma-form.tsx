'use client'

import { type CreateClassroomInput, createClassroomSchema } from '@app/shared'
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
import { BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface TurmaFormProps {
	defaultValues?: CreateClassroomInput
	onSubmit: (data: CreateClassroomInput) => void
	onCancel: () => void
	isPending: boolean
	submitLabel: string
}

export function TurmaForm({
	defaultValues,
	onSubmit,
	onCancel,
	isPending,
	submitLabel,
}: TurmaFormProps) {
	const form = useForm<CreateClassroomInput>({
		resolver: zodResolver(createClassroomSchema),
		defaultValues: defaultValues ?? {
			name: '',
			subject: '',
			description: '',
		},
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel required>Nome da turma</FormLabel>
							<FormControl>
								<Input placeholder="8º Ano A" disabled={isPending} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="subject"
					render={({ field }) => (
						<FormItem>
							<FormLabel required leftIcon={<BookOpen className="size-3.5" />}>
								Disciplina
							</FormLabel>
							<FormControl>
								<Input
									placeholder="História Geral"
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
									placeholder="Alguma observação sobre a turma..."
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
						{submitLabel}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	)
}
