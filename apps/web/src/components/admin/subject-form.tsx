'use client'

import { type CreateSubjectInput, createSubjectSchema } from '@app/shared'
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
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface SubjectFormProps {
	defaultValues?: CreateSubjectInput
	onSubmit: (data: CreateSubjectInput) => void
	onCancel: () => void
	isPending: boolean
	submitLabel: string
}

export function SubjectForm({
	defaultValues,
	onSubmit,
	onCancel,
	isPending,
	submitLabel,
}: SubjectFormProps) {
	const form = useForm<CreateSubjectInput>({
		resolver: zodResolver(createSubjectSchema),
		defaultValues: defaultValues ?? { name: '' },
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel required>Nome da disciplina</FormLabel>
							<FormControl>
								<Input
									placeholder="Matemática"
									disabled={isPending}
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
