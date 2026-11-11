import type { Metadata } from 'next'
import { AdminPrivilegedEmailsTable } from '@/components/admin/access-grants/admin-privileged-emails-table'

export const metadata: Metadata = {
	title: 'E-mails privilegiados — Admin — Gabarita.app',
	description: 'E-mails que ganham a cortesia do plano Pro automaticamente.',
}

export default function AdminPrivilegiadosPage() {
	return <AdminPrivilegedEmailsTable />
}
