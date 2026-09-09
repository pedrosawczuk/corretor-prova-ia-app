import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@app/ui'
import { CorrigirProva } from '@/components/dashboard/corrigir-prova'

export const metadata: Metadata = {
	title: 'Corrigir prova — Gabarita.app',
	description: 'Corrija provas por foto com o Gabarita.app.',
}

interface CorrigirProvaPageProps {
	params: Promise<{ id: string; examId: string }>
}

export default async function CorrigirProvaPage({
	params,
}: CorrigirProvaPageProps) {
	const { id, examId } = await params

	return (
		<Suspense
			fallback={
				<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-64 rounded-2xl" />
				</div>
			}
		>
			<CorrigirProva turmaId={id} examId={examId} />
		</Suspense>
	)
}
