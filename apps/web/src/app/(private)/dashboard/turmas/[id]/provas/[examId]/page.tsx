import type { Metadata } from 'next'
import { ProvaDetail } from '@/components/dashboard/prova-detail'

export const metadata: Metadata = {
	title: 'Prova — Gabarita.app',
	description:
		'Configure e gere as questões da prova com a IA do Gabarita.app.',
}

interface ProvaDetailPageProps {
	params: Promise<{ id: string; examId: string }>
}

export default async function ProvaDetailPage({
	params,
}: ProvaDetailPageProps) {
	const { id, examId } = await params

	return <ProvaDetail turmaId={id} examId={examId} />
}
