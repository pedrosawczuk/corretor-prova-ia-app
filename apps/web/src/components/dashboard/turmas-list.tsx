'use client'

import { Skeleton } from '@app/ui'
import { LayoutDashboard } from 'lucide-react'
import { useClassrooms } from '@/hooks/use-classrooms'
import { CriarTurmaDialog } from './criar-turma-dialog'
import { TurmaCard } from './turma-card'

export function TurmasList() {
	const { data: classrooms, isLoading, isError } = useClassrooms()

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Skeleton className="h-40 rounded-2xl" />
				<Skeleton className="h-40 rounded-2xl" />
				<Skeleton className="h-40 rounded-2xl" />
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
				<p className="text-sm text-muted-foreground">
					Não foi possível carregar suas turmas. Tente recarregar a página.
				</p>
			</div>
		)
	}

	if (!classrooms || classrooms.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
				<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
					<LayoutDashboard className="size-6" />
				</div>
				<h2 className="text-base font-semibold text-foreground">
					Nenhuma turma criada ainda
				</h2>
				<p className="max-w-sm text-sm text-muted-foreground">
					Crie sua primeira turma para começar a gerar e organizar provas com a
					IA do Gabarita.app.
				</p>
				<CriarTurmaDialog />
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{classrooms.map((classroom) => (
				<TurmaCard key={classroom.id} classroom={classroom} />
			))}
		</div>
	)
}
