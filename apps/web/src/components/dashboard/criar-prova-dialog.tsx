'use client'

import type { CreateExamInput } from '@app/shared'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	toast,
} from '@app/ui'
import { Sparkles } from 'lucide-react'
import { useCreateExam } from '@/hooks/use-exams'
import { toastApiError } from '@/lib/api-error-handler'
import { CriarProvaForm } from './criar-prova-form'

interface CriarProvaDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	classroomId: string
}

export function CriarProvaDialog({
	open,
	onOpenChange,
	classroomId,
}: CriarProvaDialogProps) {
	const createExam = useCreateExam(classroomId)

	function onSubmit(data: CreateExamInput) {
		createExam.mutate(data, {
			onSuccess: () => {
				toast.success('Prova criada com sucesso!')
				onOpenChange(false)
			},
			onError: (error) => {
				toastApiError(error, 'Não foi possível criar a prova. Tente novamente.')
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Sparkles className="size-5 text-primary" />
						Gerar Prova
					</DialogTitle>
					<DialogDescription>
						Dê um nome e uma breve descrição. Depois de criada, você configura a
						dificuldade e a quantidade de questões.
					</DialogDescription>
				</DialogHeader>

				<CriarProvaForm
					classroomId={classroomId}
					onSubmit={onSubmit}
					onCancel={() => onOpenChange(false)}
					isPending={createExam.isPending}
				/>
			</DialogContent>
		</Dialog>
	)
}
