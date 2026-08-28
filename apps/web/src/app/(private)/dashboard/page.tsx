import { Button } from '@app/ui'
import { LayoutDashboard, Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Dashboard — Gabarita.app',
	description: 'Acompanhe suas turmas e provas em um só lugar.',
}

export default function DashboardPage() {
	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						Dashboard
					</h1>
					<p className="text-sm text-muted-foreground">
						Acompanhe suas turmas e provas em um só lugar.
					</p>
				</div>
				<Button size="sm" leftIcon={<Plus />}>
					Nova Turma
				</Button>
			</div>

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
				<Button size="sm" leftIcon={<Plus />} className="mt-2">
					Criar Turma
				</Button>
			</div>
		</div>
	)
}
