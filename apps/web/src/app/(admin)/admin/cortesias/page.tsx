import type { Metadata } from 'next'
import { AdminAccessGrantsTable } from '@/components/admin/access-grants/admin-access-grants-table'

export const metadata: Metadata = {
	title: 'Cortesias — Admin — Gabarita.app',
	description: 'Professores que usam ou usaram o plano Pro de graça.',
}

export default function AdminCortesiasPage() {
	return <AdminAccessGrantsTable />
}
