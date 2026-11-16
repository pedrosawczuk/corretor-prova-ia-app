import { Toaster } from '@app/ui'
import type { Metadata, Viewport } from 'next'
import { Sora } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
import './globals.css'

const sora = Sora({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
})

export const metadata: Metadata = {
	metadataBase: new URL('https://corrigego.com.br'),
	title: 'Corrige Go — Correção Inteligente de Provas com IA',
	description:
		'Corrija pilhas de provas escolares em minutos com a câmera do seu celular. Sem cadastro de alunos e com total privacidade.',
	openGraph: {
		type: 'website',
		locale: 'pt_BR',
		url: 'https://corrigego.com.br',
		siteName: 'CorrigeGo',
		title: 'CorrigeGo — Correção Inteligente de Provas com IA',
		description:
			'Corrija pilhas de provas escolares em minutos com a câmera do seu celular. Sem cadastro de alunos e com total privacidade.',
		images: [
			{
				url: '/og-image.png',
				width: 1600,
				height: 455,
				alt: 'CorrigeGo',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'CorrigeGo — Correção Inteligente de Provas com IA',
		description:
			'Corrija pilhas de provas escolares em minutos com a câmera do seu celular. Sem cadastro de alunos e com total privacidade.',
		images: ['/og-image.png'],
	},
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: '48x48' },
			{ url: '/favicon.svg', type: 'image/svg+xml' },
		],
		apple: '/apple-touch-icon.png',
	},
	manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
	themeColor: '#6E56CF',
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
