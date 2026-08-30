'use client'

import type { CreateSubjectInput } from '@app/shared'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	toast,
} from '@app/ui'
import { Pencil } from 'lucide-react'
import { useUpdateAdminSubject } from '@/hooks/use-admin-subjects'
import type { Subject } from '@/hooks/use-subjects'
import { toastApiError } from '@/lib/api-error-handler'
import { SubjectForm } from './subject-form'

interface EditarDisciplinaDialogProps {
	subject: Subject
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditarDisciplinaDialog({
	subject,
	open,
	onOpenChange,
}: EditarDisciplinaDialogProps) {
	const updateSubject = useUpdateAdminSubject(subject.id)

	function onSubmit(data: CreateSubjectInput) {
		updateSubject.mutate(data, {
			onSuccess: () => {
				toast.success('Disciplina atualizada com sucesso!')
				onOpenChange(false)
			},
			onError: (error) => {
				toastApiError(
					error,
					'Não foi possível atualizar a disciplina. Tente novamente.',
				)
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Pencil className="size-5 text-primary" />
						Editar disciplina
					</DialogTitle>
					<DialogDescription>
						Atualize o nome de {subject.name}.
					</DialogDescription>
				</DialogHeader>

				<SubjectForm
					defaultValues={{ name: subject.name }}
					onSubmit={onSubmit}
					onCancel={() => onOpenChange(false)}
					isPending={updateSubject.isPending}
					submitLabel="Salvar alterações"
				/>
			</DialogContent>
		</Dialog>
	)
}
