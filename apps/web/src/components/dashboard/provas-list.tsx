'use client'

import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from '@app/ui'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { useExams } from '@/hooks/use-exams'
import { formatDate } from '@/lib/date'

interface ProvasListProps {
	turmaId: string
}

export function ProvasList({ turmaId }: ProvasListProps) {
	const { data: exams, isLoading, isError } = useExams(turmaId)

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					<Skeleton key={index} className="h-32 rounded-2xl" />
				))}
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
				<p className="text-sm text-muted-foreground">
					Não foi possível carregar as provas. Tente recarregar a página.
				</p>
			</div>
		)
	}

	if (!exams || exams.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
				<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
					<FileText className="size-6" />
				</div>
				<h2 className="text-base font-semibold text-foreground">
					Nenhuma prova criada nesta turma
				</h2>
				<p className="max-w-sm text-sm text-muted-foreground">
					Clique em "Gerar Prova" para criar a primeira.
				</p>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{exams.map((exam) => (
				<Link
					key={exam.id}
					href={`/dashboard/turmas/${turmaId}/provas/${exam.id}`}
				>
					<Card variant="default" interactive className="h-full">
						<CardHeader>
							<div className="flex items-center justify-between gap-2">
								<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
									<FileText className="size-5" />
								</div>
								<Badge
									variant={
										exam.questions.length > 0 ? 'success-outline' : 'subtle'
									}
									size="sm"
								>
									{exam.questions.length > 0
										? `${exam.questions.length} questão(ões)`
										: 'Sem questões'}
								</Badge>
							</div>
							<CardTitle className="mt-1">{exam.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="line-clamp-2 wrap-break-word text-sm text-muted-foreground">
								{exam.description || 'Sem descrição.'}
							</p>
							<p className="mt-3 text-xs text-muted-foreground">
								Criada em {formatDate(exam.createdAt, 'DD [de] MMM [de] YYYY')}
							</p>
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	)
}
