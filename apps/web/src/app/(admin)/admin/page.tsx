import type { Metadata } from 'next'
import { AdminOverview } from '@/components/admin/admin-overview'

export const metadata: Metadata = {
	title: 'Admin — Gabarita.app',
	description: 'Usuários, atividade e segurança da plataforma.',
}

export default function AdminPage() {
	return <AdminOverview />
}
