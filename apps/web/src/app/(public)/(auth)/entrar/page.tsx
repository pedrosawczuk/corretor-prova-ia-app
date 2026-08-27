import type { Metadata } from 'next'
import { EntrarForm } from '@/components/auth/entrar-form'

export const metadata: Metadata = {
	title: 'Entrar — Gabarita.app',
	description:
		'Acesse seu painel docente para gerenciar turmas e corrigir avaliações com IA.',
}

export default function EntrarPage() {
	return <EntrarForm />
}
