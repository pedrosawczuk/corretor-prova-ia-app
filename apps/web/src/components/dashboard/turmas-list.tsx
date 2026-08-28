'use client'

import { useClassrooms } from '@/hooks/use-classrooms'
import { formatDate } from '@/lib/date'
import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from '@app/ui'
import { LayoutDashboard, Users } from 'lucide-react'
import Link from 'next/link'
import { CriarTurmaDialog } from './criar-turma-dialog'

export function TurmasList() {
	const { data: classrooms, isLoading, isError } = useClassrooms()

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					<Skeleton key={index} className="h-40 rounded-2xl" />
				))}
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
				<Link key={classroom.id} href={`/dashboard/turmas/${classroom.id}`}>
					<Card variant="default" interactive className="h-full">
						<CardHeader>
							<div className="flex items-center justify-between gap-2">
								<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
									<Users className="size-5" />
								</div>
								<Badge variant="subtle" size="sm">
									{classroom.subject}
								</Badge>
							</div>
							<CardTitle className="mt-1">{classroom.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="line-clamp-2 wrap-break-word text-sm text-muted-foreground">
								{classroom.description || 'Sem descrição.'}
							</p>
							<p className="mt-3 text-xs text-muted-foreground">
								Criada em{' '}
								{formatDate(classroom.createdAt, 'DD [de] MMM [de] YYYY')}
							</p>
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	)
}
