import { Button } from '@app/ui'
import { AlertTriangle, ArrowLeft, Home, MailWarning } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthErrorInfo } from '@/lib/auth-error-messages'

export const metadata: Metadata = {
	title: 'Erro ao Entrar — Gabarita.app',
	description: 'Não foi possível concluir sua autenticação.',
}

interface ErroAutenticacaoPageProps {
	searchParams: Promise<{ error?: string }>
}

export default async function ErroAutenticacaoPage({
	searchParams,
}: ErroAutenticacaoPageProps) {
	const { error } = await searchParams
	const info = getAuthErrorInfo(error)
	const isResendAction = info.action === 'resend-verification'

	return (
		<div className="w-full space-y-6 text-left">
			<div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
				{isResendAction ? (
					<MailWarning className="size-6" />
				) : (
					<AlertTriangle className="size-6" />
				)}
			</div>

			<div className="space-y-2">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
					{info.title}
				</h1>
				<p className="text-sm text-muted-foreground leading-relaxed">
					{info.description}
				</p>
			</div>

			{isResendAction ? (
				<Button variant="default" fullWidth size="lg" asChild>
					<Link href="/verificar-email">Reenviar e-mail de confirmação</Link>
				</Button>
			) : (
				<Button variant="default" fullWidth size="lg" asChild>
					<Link href="/entrar">Tentar novamente</Link>
				</Button>
			)}

			<div className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
				{isResendAction ? (
					<Link
						href="/entrar"
						className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
					>
						<ArrowLeft className="size-3.5" />
						Voltar para o login
					</Link>
				) : (
					<Link
						href="/"
						className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
					>
						<Home className="size-3.5" />
						Ir para o início
					</Link>
				)}
			</div>
		</div>
	)
}
