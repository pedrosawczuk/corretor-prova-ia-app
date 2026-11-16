import type { Metadata } from 'next'
import { CriarContaForm } from '@/components/auth/criar-conta-form'

export const metadata: Metadata = {
	title: 'Criar Conta Gratuita — Corrige Go',
	description:
		'Cadastre-se gratuitamente e comece a elaborar e corrigir provas escolares com IA.',
}

interface CriarContaPageProps {
	searchParams: Promise<{ email?: string }>
}

export default async function CriarContaPage({
	searchParams,
}: CriarContaPageProps) {
	const { email } = await searchParams

	return <CriarContaForm defaultEmail={email} />
}
