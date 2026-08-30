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
	Select,
	SelectItem,
	Textarea,
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSubjects } from '@/hooks/use-subjects'

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
	const { data: subjects, isLoading: isLoadingSubjects } = useSubjects()

	const form = useForm<CreateClassroomInput>({
		resolver: zodResolver(createClassroomSchema),
		defaultValues: defaultValues ?? {
			name: '',
			subjectId: '',
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

				<div className="flex flex-col gap-1.5">
					<FormField
						control={form.control}
						name="subjectId"
						render={({ field, fieldState }) => (
							<Select
								label="Disciplina"
								required
								placeholder="Selecione a disciplina"
								value={field.value}
								onValueChange={field.onChange}
								disabled={isPending || isLoadingSubjects}
								errorMessage={fieldState.error?.message}
							>
								{subjects?.map((subject) => (
									<SelectItem key={subject.id} value={subject.id}>
										{subject.name}
									</SelectItem>
								))}
							</Select>
						)}
					/>
					<p className="text-xs text-muted-foreground">
						Não encontrou a disciplina?{' '}
						<a
							href="mailto:contato@gabarita.app?subject=Nova%20disciplina"
							className="text-primary hover:underline"
						>
							Peça pra gente adicionar
						</a>
						.
					</p>
				</div>

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
