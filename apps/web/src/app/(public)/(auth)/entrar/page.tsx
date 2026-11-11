import type { Metadata } from 'next'
import { EntrarForm } from '@/components/auth/entrar-form'

export const metadata: Metadata = {
	title: 'Entrar — Gabarita.app',
	description:
		'Acesse seu painel docente para gerenciar turmas e corrigir avaliações com IA.',
}

interface EntrarPageProps {
	searchParams: Promise<{ email?: string }>
}

export default async function EntrarPage({ searchParams }: EntrarPageProps) {
	const { email } = await searchParams

	return <EntrarForm defaultEmail={email} />
}
