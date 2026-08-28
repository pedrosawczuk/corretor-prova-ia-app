'use client'

import type { CreateClassroomInput } from '@app/shared'
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
import { Plus, Users } from 'lucide-react'
import * as React from 'react'
import { useCreateClassroom } from '@/hooks/use-classrooms'
import { toastApiError } from '@/lib/api-error-handler'
import { TurmaForm } from './turma-form'

export function CriarTurmaDialog() {
	const [open, setOpen] = React.useState(false)
	const createClassroom = useCreateClassroom()

	function onSubmit(data: CreateClassroomInput) {
		createClassroom.mutate(data, {
			onSuccess: () => {
				toast.success('Turma criada com sucesso!')
				setOpen(false)
			},
			onError: (error) => {
				toastApiError(error, 'Não foi possível criar a turma. Tente novamente.')
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" leftIcon={<Plus />}>
					Nova Turma
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Users className="size-5 text-primary" />
						Criar nova turma
					</DialogTitle>
					<DialogDescription>
						Turmas organizam suas provas por sala. Você pode criar quantas
						precisar.
					</DialogDescription>
				</DialogHeader>

				<TurmaForm
					onSubmit={onSubmit}
					onCancel={() => setOpen(false)}
					isPending={createClassroom.isPending}
					submitLabel="Criar turma"
				/>
			</DialogContent>
		</Dialog>
	)
}
