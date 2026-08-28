'use client'

import type { Exam, GenerateExamInput } from '@app/shared'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	toast,
} from '@app/ui'
import { Sparkles } from 'lucide-react'
import { useClassroom, useClassrooms } from '@/hooks/use-classrooms'
import { useGenerateExam } from '@/hooks/use-exams'
import { toastApiError } from '@/lib/api-error-handler'
import { GerarProvaForm } from './gerar-prova-form'

interface GerarProvaDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	classroomId?: string
	onGenerated: (exam: Exam) => void
}

export function GerarProvaDialog({
	open,
	onOpenChange,
	classroomId,
	onGenerated,
}: GerarProvaDialogProps) {
	const { data: classroom } = useClassroom(classroomId ?? '')
	const { data: classroomsList } = useClassrooms()
	const generateExam = useGenerateExam()

	const classrooms = classroomId
		? classroom
			? [classroom]
			: []
		: classroomsList

	function onSubmit(data: GenerateExamInput) {
		generateExam.mutate(data, {
			onSuccess: (exam) => {
				onGenerated(exam)
				onOpenChange(false)
				toast.success('Prova gerada com sucesso!')
			},
			onError: (error) => {
				toastApiError(error, 'Não foi possível gerar a prova. Tente novamente.')
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
						Escolha a turma, a dificuldade e a quantidade de questões. A IA do
						Gabarita.app monta a prova para você.
					</DialogDescription>
				</DialogHeader>

				<GerarProvaForm
					classroomId={classroomId}
					classrooms={classrooms}
					onSubmit={onSubmit}
					onCancel={() => onOpenChange(false)}
					isPending={generateExam.isPending}
				/>
			</DialogContent>
		</Dialog>
	)
}
