import type { Metadata } from 'next'
import { AdminSessionsTable } from '@/components/admin/admin-sessions-table'

export const metadata: Metadata = {
	title: 'Sessões — Admin — Gabarita.app',
	description: 'Dispositivos e IPs conectados à plataforma.',
}

export default function AdminSessoesPage() {
	return <AdminSessionsTable />
}
