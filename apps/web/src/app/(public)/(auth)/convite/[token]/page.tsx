import type { Metadata } from 'next'
import { ConviteContent } from '@/components/auth/convite-content'

export const metadata: Metadata = {
	title: 'Convite — Gabarita.app',
	description: 'Você foi convidado para usar o plano Pro da gabarita.app.',
	robots: { index: false, follow: false },
}

interface ConvitePageProps {
	params: Promise<{ token: string }>
}

export default async function ConvitePage({ params }: ConvitePageProps) {
	const { token } = await params

	return <ConviteContent token={token} />
}
