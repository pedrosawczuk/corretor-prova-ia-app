import type { Metadata } from 'next'
import { AdminActivityCharts } from '@/components/admin/admin-activity-charts'

export const metadata: Metadata = {
	title: 'Atividade — Admin — Corrige Go',
	description: 'Logins ao longo do tempo e auditoria de segurança.',
}

export default function AdminAtividadePage() {
	return <AdminActivityCharts />
}
