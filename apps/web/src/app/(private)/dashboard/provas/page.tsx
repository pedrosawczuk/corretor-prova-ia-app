import type { Metadata } from 'next'
import { ProvasDashboard } from '@/components/dashboard/provas-dashboard'

export const metadata: Metadata = {
	title: 'Provas — Gabarita.app',
	description: 'Gere e organize as provas das suas turmas.',
}

export default function ProvasPage() {
	return <ProvasDashboard />
}
