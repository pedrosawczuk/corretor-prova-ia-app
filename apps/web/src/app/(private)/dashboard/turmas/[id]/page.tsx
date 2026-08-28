import type { Metadata } from 'next'
import { TurmaDetail } from '@/components/dashboard/turma-detail'

export const metadata: Metadata = {
	title: 'Turma — Gabarita.app',
	description: 'Detalhes da turma, provas e histórico de correções.',
}

interface TurmaDetailPageProps {
	params: Promise<{ id: string }>
}

export default async function TurmaDetailPage({
	params,
}: TurmaDetailPageProps) {
	const { id } = await params

	return <TurmaDetail id={id} />
}
