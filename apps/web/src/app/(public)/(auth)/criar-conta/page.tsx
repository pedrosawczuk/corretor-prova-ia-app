import type { Metadata } from 'next'
import { CriarContaForm } from '@/components/auth/criar-conta-form'

export const metadata: Metadata = {
	title: 'Criar Conta Gratuita — Gabarita.app',
	description:
		'Cadastre-se gratuitamente e comece a elaborar e corrigir provas escolares com IA.',
}

export default function CriarContaPage() {
	return <CriarContaForm />
}
