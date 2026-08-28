import type { Metadata } from 'next'
import { CriarTurmaDialog } from '@/components/dashboard/criar-turma-dialog'
import { TurmasList } from '@/components/dashboard/turmas-list'

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
				<CriarTurmaDialog />
			</div>

			<TurmasList />
		</div>
	)
}
