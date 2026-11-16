import type { Metadata } from 'next'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export const metadata: Metadata = {
	title: 'Dashboard — Corrige Go',
	description: 'Acompanhe suas turmas e provas em um só lugar.',
}

export default function DashboardPage() {
	return <DashboardOverview />
}
