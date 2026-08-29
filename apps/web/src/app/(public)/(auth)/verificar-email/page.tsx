import type { Metadata } from 'next'
import { VerificarEmailContent } from '@/components/auth/verificar-email-content'

export const metadata: Metadata = {
	title: 'Confirmar E-mail — Gabarita.app',
	description: 'Confirme seu e-mail para ativar sua conta.',
}

interface VerificarEmailPageProps {
	searchParams: Promise<{ error?: string; email?: string }>
}

export default async function VerificarEmailPage({
	searchParams,
}: VerificarEmailPageProps) {
	const { error, email } = await searchParams

	return <VerificarEmailContent error={error} email={email} />
}
