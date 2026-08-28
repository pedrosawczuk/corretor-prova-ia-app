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
import { useRouter } from 'next/navigation'
import type { Classroom } from '@/hooks/use-classrooms'
import { useDeleteClassroom } from '@/hooks/use-classrooms'
import { toastApiError } from '@/lib/api-error-handler'

interface ExcluirTurmaDialogProps {
	classroom: Classroom
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ExcluirTurmaDialog({
	classroom,
	open,
	onOpenChange,
}: ExcluirTurmaDialogProps) {
	const router = useRouter()
	const deleteClassroom = useDeleteClassroom()

	function handleDelete() {
		deleteClassroom.mutate(classroom.id, {
			onSuccess: () => {
				toast.success('Turma excluída com sucesso.')
				onOpenChange(false)
				router.push('/dashboard')
			},
			onError: (error) => {
				toastApiError(
					error,
					'Não foi possível excluir a turma. Tente novamente.',
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
					<AlertDialogTitle>Excluir {classroom.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						Essa ação não pode ser desfeita. Todas as provas e correções
						vinculadas a esta turma também serão excluídas permanentemente.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleteClassroom.isPending}>
						Cancelar
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={deleteClassroom.isPending}
						onClick={(event) => {
							event.preventDefault()
							handleDelete()
						}}
					>
						{deleteClassroom.isPending ? 'Excluindo...' : 'Excluir turma'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
