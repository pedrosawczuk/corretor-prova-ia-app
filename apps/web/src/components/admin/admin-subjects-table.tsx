'use client'

import {
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	Pagination,
	Skeleton,
} from '@app/ui'
import { Pencil, Trash2 } from 'lucide-react'
import * as React from 'react'
import { useAdminSubjects } from '@/hooks/use-admin-subjects'
import type { Subject } from '@/hooks/use-subjects'
import { formatRelativeDate } from '@/lib/date'
import { CriarDisciplinaDialog } from './criar-disciplina-dialog'
import { EditarDisciplinaDialog } from './editar-disciplina-dialog'
import { ExcluirDisciplinaDialog } from './excluir-disciplina-dialog'

const SKELETON_ROWS = Array.from({ length: 6 }, () => crypto.randomUUID())

export function AdminSubjectsTable() {
	const [page, setPage] = React.useState(1)
	const { data: subjectsPage, isLoading } = useAdminSubjects(page)
	const subjects = subjectsPage?.data
	const pagination = subjectsPage?.pagination
	const [editingSubject, setEditingSubject] = React.useState<Subject | null>(
		null,
	)
	const [deletingSubject, setDeletingSubject] = React.useState<Subject | null>(
		null,
	)

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						Disciplinas
					</h1>
					<p className="text-sm text-muted-foreground">
						Lista de disciplinas disponíveis para os professores organizarem
						turmas.
					</p>
				</div>
				<CriarDisciplinaDialog />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{pagination ? `${pagination.total} disciplinas` : 'Disciplinas'}
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{isLoading ? (
						<div className="space-y-2">
							{SKELETON_ROWS.map((rowKey) => (
								<Skeleton key={rowKey} className="h-12 w-full rounded-lg" />
							))}
						</div>
					) : !subjects || subjects.length === 0 ? (
						<p className="text-sm text-muted-foreground py-6 text-center">
							Nenhuma disciplina cadastrada.
						</p>
					) : (
						<table className="w-full text-sm min-w-[480px]">
							<thead>
								<tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
									<th className="py-2 font-medium">Disciplina</th>
									<th className="py-2 font-medium">Criada em</th>
									<th className="py-2 font-medium text-right">Ações</th>
								</tr>
							</thead>
							<tbody>
								{subjects.map((subject) => (
									<tr
										key={subject.id}
										className="border-b border-border/40 last:border-0"
									>
										<td className="py-2.5 pr-4 font-medium text-foreground">
											{subject.name}
										</td>
										<td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
											{formatRelativeDate(subject.createdAt)}
										</td>
										<td className="py-2.5 text-right">
											<Button
												size="icon-sm"
												variant="ghost"
												aria-label="Editar disciplina"
												onClick={() => setEditingSubject(subject)}
											>
												<Pencil />
											</Button>
											<Button
												size="icon-sm"
												variant="ghost"
												className="text-destructive hover:text-destructive"
												aria-label="Excluir disciplina"
												onClick={() => setDeletingSubject(subject)}
											>
												<Trash2 />
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent>
				{pagination && (
					<CardFooter className="justify-center border-t border-border/60 pt-4 sm:pt-6">
						<Pagination
							page={pagination.page}
							totalPages={pagination.totalPages}
							onPageChange={setPage}
						/>
					</CardFooter>
				)}
			</Card>

			{editingSubject && (
				<EditarDisciplinaDialog
					subject={editingSubject}
					open
					onOpenChange={(open) => {
						if (!open) setEditingSubject(null)
					}}
				/>
			)}

			{deletingSubject && (
				<ExcluirDisciplinaDialog
					subject={deletingSubject}
					open
					onOpenChange={(open) => {
						if (!open) setDeletingSubject(null)
					}}
				/>
			)}
		</div>
	)
}
