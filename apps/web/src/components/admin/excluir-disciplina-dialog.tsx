'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	toast,
} from '@app/ui'
import { Trash2 } from 'lucide-react'
import { useDeleteAdminSubject } from '@/hooks/use-admin-subjects'
import type { Subject } from '@/hooks/use-subjects'
import { toastApiError } from '@/lib/api-error-handler'

interface ExcluirDisciplinaDialogProps {
	subject: Subject
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ExcluirDisciplinaDialog({
	subject,
	open,
	onOpenChange,
}: ExcluirDisciplinaDialogProps) {
	const deleteSubject = useDeleteAdminSubject()

	function handleDelete() {
		deleteSubject.mutate(subject.id, {
			onSuccess: () => {
				toast.success('Disciplina excluída com sucesso.')
				onOpenChange(false)
			},
			onError: (error) => {
				toastApiError(
					error,
					'Não foi possível excluir a disciplina. Tente novamente.',
				)
			},
		})
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogMedia variant="destructive">
					<Trash2 />
				</AlertDialogMedia>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir {subject.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						Essa ação não pode ser desfeita. A disciplina só pode ser excluída
						se nenhuma turma estiver usando-a.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleteSubject.isPending}>
						Cancelar
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={deleteSubject.isPending}
						onClick={(event) => {
							event.preventDefault()
							handleDelete()
						}}
					>
						{deleteSubject.isPending ? 'Excluindo...' : 'Excluir disciplina'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
