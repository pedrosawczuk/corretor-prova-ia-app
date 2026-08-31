import type { Metadata } from 'next'
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

	return <CorrigirProva turmaId={id} examId={examId} />
}
