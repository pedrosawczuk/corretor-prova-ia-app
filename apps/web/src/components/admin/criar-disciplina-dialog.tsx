'use client'

import type { CreateSubjectInput } from '@app/shared'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	toast,
} from '@app/ui'
import { BookOpen, Plus } from 'lucide-react'
import * as React from 'react'
import { useCreateAdminSubject } from '@/hooks/use-admin-subjects'
import { toastApiError } from '@/lib/api-error-handler'
import { SubjectForm } from './subject-form'

export function CriarDisciplinaDialog() {
	const [open, setOpen] = React.useState(false)
	const createSubject = useCreateAdminSubject()

	function onSubmit(data: CreateSubjectInput) {
		createSubject.mutate(data, {
			onSuccess: () => {
				toast.success('Disciplina criada com sucesso!')
				setOpen(false)
			},
			onError: (error) => {
				toastApiError(error, 'Não foi possível criar a disciplina. Tente novamente.')
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" leftIcon={<Plus />}>
					Nova Disciplina
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<BookOpen className="size-5 text-primary" />
						Criar nova disciplina
					</DialogTitle>
					<DialogDescription>
						Disciplinas ficam disponíveis para todos os professores
						organizarem suas turmas.
					</DialogDescription>
				</DialogHeader>

				<SubjectForm
					onSubmit={onSubmit}
					onCancel={() => setOpen(false)}
					isPending={createSubject.isPending}
					submitLabel="Criar disciplina"
				/>
			</DialogContent>
		</Dialog>
	)
}
