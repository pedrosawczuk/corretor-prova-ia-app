import { Badge, Card, CardContent, CardHeader, CardTitle } from '@app/ui'
import { Users } from 'lucide-react'
import Link from 'next/link'
import type { Classroom } from '@/hooks/use-classrooms'
import { useSubjectNameMap } from '@/hooks/use-subjects'
import { formatDate } from '@/lib/date'

interface TurmaCardProps {
	classroom: Classroom
}

export function TurmaCard({ classroom }: TurmaCardProps) {
	const subjectNameById = useSubjectNameMap()
	const subjectName = subjectNameById.get(classroom.subjectId)

	return (
		<Link href={`/dashboard/turmas/${classroom.id}`}>
			<Card variant="default" interactive className="h-full">
				<CardHeader>
					<div className="flex items-center justify-between gap-2">
						<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
							<Users className="size-5" />
						</div>
						<Badge variant="subtle" size="sm">
							{subjectName ?? '—'}
						</Badge>
					</div>
					<CardTitle className="mt-1">{classroom.name}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="line-clamp-2 wrap-break-word text-sm text-muted-foreground">
						{classroom.description || 'Sem descrição.'}
					</p>
					<p className="mt-3 text-xs text-muted-foreground">
						Criada em {formatDate(classroom.createdAt, 'DD [de] MMM [de] YYYY')}
					</p>
				</CardContent>
			</Card>
		</Link>
	)
}
