import type { Metadata } from 'next'
import { RedefinirSenhaForm } from '@/components/auth/redefinir-senha-form'

export const metadata: Metadata = {
	title: 'Redefinir Senha — Gabarita.app',
	description: 'Crie uma nova senha para acessar sua conta.',
}

interface RedefinirSenhaPageProps {
	searchParams: Promise<{ token?: string }>
}

export default async function RedefinirSenhaPage({
	searchParams,
}: RedefinirSenhaPageProps) {
	const { token } = await searchParams

	return <RedefinirSenhaForm token={token} />
}
