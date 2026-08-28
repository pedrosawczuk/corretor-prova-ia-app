import { Toaster } from '@app/ui'
import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
import './globals.css'

const sora = Sora({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'Gabarita.app — Correção Inteligente de Provas com IA',
	description:
		'Corrija pilhas de provas escolares em minutos com a câmera do seu celular. Sem cadastro de alunos e com total privacidade.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="pt-BR"
			className={`${sora.variable} font-sans`}
			suppressHydrationWarning
		>
			<body
				className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20"
				suppressHydrationWarning
			>
				<QueryProvider>
					{children}
					<Toaster richColors position="top-right" />
				</QueryProvider>
			</body>
		</html>
	)
}
