import type { Metadata } from 'next'
import { AdminInvitesTable } from '@/components/admin/access-grants/admin-invites-table'

export const metadata: Metadata = {
	title: 'Convites — Admin — Corrige Go',
	description:
		'Convide professores para usar o plano Pro de graça por 3 meses.',
}

export default function AdminConvitesPage() {
	return <AdminInvitesTable />
}
