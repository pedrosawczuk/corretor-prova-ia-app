import type { Metadata } from 'next'
import { AdminUsersTable } from '@/components/admin/admin-users-table'

export const metadata: Metadata = {
	title: 'Usuários — Admin — Gabarita.app',
	description: 'Papéis, verificação em duas etapas e atividade de cada conta.',
}

export default function AdminUsuariosPage() {
	return <AdminUsersTable />
}
