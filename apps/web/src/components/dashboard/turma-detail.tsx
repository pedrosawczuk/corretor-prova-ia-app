'use client'

import { useClassroom } from '@/hooks/use-classrooms'
import { ApiError } from '@/lib/api-client'
import { formatDate } from '@/lib/date'
import { Badge, Button, Card, CardContent, CardHeader, Skeleton } from '@app/ui'
import {
	ArrowLeft,
	BookOpen,
	FileText,
	Pencil,
	SearchX,
	Trash2,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { EditarTurmaDialog } from './editar-turma-dialog'
import { ExcluirTurmaDialog } from './excluir-turma-dialog'

interface TurmaDetailProps {
	id: string
}

export function TurmaDetail({ id }: TurmaDetailProps) {
	const { data: classroom, isLoading, error } = useClassroom(id)
	const [editOpen, setEditOpen] = React.useState(false)
	const [deleteOpen, setDeleteOpen] = React.useState(false)

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-40 rounded-2xl" />
			</div>
		)
	}

	if (error || !classroom) {
		const isNotFound = error instanceof ApiError && error.code === 'NOT_FOUND'

		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
				<div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
					<SearchX className="size-6" />
				</div>
				<h1 className="text-base font-semibold text-foreground">
					{isNotFound
						? 'Turma não encontrada'
						: 'Não foi possível carregar a turma'}
				</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					{isNotFound
						? 'Essa turma não existe ou foi removida.'
						: 'Tente recarregar a página em alguns instantes.'}
				</p>
				<Button variant="outline" size="sm" asChild leftIcon={<ArrowLeft />}>
					<Link href="/dashboard">Voltar para o Dashboard</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div className="flex items-center justify-between gap-4">
				<Link
					href="/dashboard"
					className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="size-3.5" />
					Voltar para o Dashboard
				</Link>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						leftIcon={<Pencil />}
						onClick={() => setEditOpen(true)}
					>
						Editar
					</Button>
					<Button
						variant="destructive-outline"
						size="sm"
						leftIcon={<Trash2 />}
						onClick={() => setDeleteOpen(true)}
					>
						Excluir
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
								<Users className="size-6" />
							</div>
							<div>
								<h1 className="text-xl font-bold tracking-tight text-foreground">
									{classroom.name}
								</h1>
								<div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
									<BookOpen className="size-3.5" />
									<span>{classroom.subject}</span>
								</div>
							</div>
						</div>
						<Badge variant="subtle" size="sm">
							Criada em {formatDate(classroom.createdAt)}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<p className="whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground leading-relaxed">
						{classroom.description || 'Esta turma ainda não possui descrição.'}
					</p>
				</CardContent>
			</Card>

			<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
				<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
					<FileText className="size-6" />
				</div>
				<h2 className="text-base font-semibold text-foreground">
					Nenhuma prova criada nesta turma
				</h2>
				<p className="max-w-sm text-sm text-muted-foreground">
					Em breve você poderá gerar e organizar provas para {classroom.name}{' '}
					por aqui.
				</p>
			</div>

			<EditarTurmaDialog
				classroom={classroom}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>
			<ExcluirTurmaDialog
				classroom={classroom}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</div>
	)
}
