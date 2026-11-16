import type { Metadata } from 'next'
import { ConviteContent } from '@/components/auth/convite-content'

export const metadata: Metadata = {
	title: 'Convite — Corrige Go',
	description: 'Você foi convidado para usar o plano Pro do Corrige Go.',
	robots: { index: false, follow: false },
}

interface ConvitePageProps {
	params: Promise<{ token: string }>
}

export default async function ConvitePage({ params }: ConvitePageProps) {
	const { token } = await params

	return <ConviteContent token={token} />
}
