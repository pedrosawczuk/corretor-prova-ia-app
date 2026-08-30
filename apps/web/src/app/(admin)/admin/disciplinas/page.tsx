import type { Metadata } from 'next'
import { AdminSubjectsTable } from '@/components/admin/admin-subjects-table'

export const metadata: Metadata = {
	title: 'Disciplinas — Admin — Gabarita.app',
	description:
		'Gerencie a lista global de disciplinas disponível para os professores.',
}

export default function AdminDisciplinasPage() {
	return <AdminSubjectsTable />
}
