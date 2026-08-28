import type { Metadata } from 'next'
import { RecuperarSenhaForm } from '@/components/auth/recuperar-senha-form'

export const metadata: Metadata = {
	title: 'Recuperar Senha — Gabarita.app',
	description:
		'Esqueceu sua senha? Informe seu e-mail e receba um link para criar uma nova senha.',
}

export default function RecuperarSenhaPage() {
	return <RecuperarSenhaForm />
}
