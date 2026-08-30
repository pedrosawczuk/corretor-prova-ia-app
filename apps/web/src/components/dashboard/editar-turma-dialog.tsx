'use client'

import type { CreateClassroomInput } from '@app/shared'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	toast,
} from '@app/ui'
import { Pencil } from 'lucide-react'
import type { Classroom } from '@/hooks/use-classrooms'
import { useUpdateClassroom } from '@/hooks/use-classrooms'
import { toastApiError } from '@/lib/api-error-handler'
import { TurmaForm } from './turma-form'

interface EditarTurmaDialogProps {
	classroom: Classroom
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditarTurmaDialog({
	classroom,
	open,
	onOpenChange,
}: EditarTurmaDialogProps) {
	const updateClassroom = useUpdateClassroom(classroom.id)

	function onSubmit(data: CreateClassroomInput) {
		updateClassroom.mutate(data, {
			onSuccess: () => {
				toast.success('Turma atualizada com sucesso!')
				onOpenChange(false)
			},
			onError: (error) => {
				toastApiError(
					error,
					'Não foi possível atualizar a turma. Tente novamente.',
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
						Editar turma
					</DialogTitle>
					<DialogDescription>
						Atualize as informações de {classroom.name}.
					</DialogDescription>
				</DialogHeader>

				<TurmaForm
					defaultValues={{
						name: classroom.name,
						subjectId: classroom.subjectId,
						description: classroom.description ?? '',
					}}
					onSubmit={onSubmit}
					onCancel={() => onOpenChange(false)}
					isPending={updateClassroom.isPending}
					submitLabel="Salvar alterações"
				/>
			</DialogContent>
		</Dialog>
	)
}
