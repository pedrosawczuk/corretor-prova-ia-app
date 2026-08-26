import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'Corretor de Prova IA',
	description: 'Correção automatizada e inteligente de avaliações escolares',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR">
			<body className="antialiased">{children}</body>
		</html>
	)
}
