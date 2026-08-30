import dayjs from '@app/dayjs'
import { Activity, MonitorSmartphone, Users } from 'lucide-react'

export const SIGNUP_HISTORY_DAYS = 30
export const EXAMS_HISTORY_DAYS = 30
export const TWO_FACTOR_CHART_COLORS = [
	'var(--color-success)',
	'var(--color-muted)',
]
export const EXAM_STATUS_CHART_COLORS = [
	'var(--color-success)',
	'var(--color-muted)',
]

export function buildSignupsPerDay(createdAtDates: string[]) {
	return Array.from({ length: SIGNUP_HISTORY_DAYS }).map((_, index) => {
		const day = dayjs().subtract(SIGNUP_HISTORY_DAYS - 1 - index, 'day')

		const total = createdAtDates.filter((createdAt) =>
			dayjs(createdAt).isSame(day, 'day'),
		).length

		return { day: day.format('DD/MM'), total }
	})
}

export function buildExamsPerDay(createdAtDates: string[]) {
	return Array.from({ length: EXAMS_HISTORY_DAYS }).map((_, index) => {
		const day = dayjs().subtract(EXAMS_HISTORY_DAYS - 1 - index, 'day')

		const total = createdAtDates.filter((createdAt) =>
			dayjs(createdAt).isSame(day, 'day'),
		).length

		return { day: day.format('DD/MM'), total }
	})
}

export function buildTwoFactorBreakdown(enabled: number, total: number) {
	return [
		{ name: 'Ativo', value: enabled },
		{ name: 'Inativo', value: Math.max(total - enabled, 0) },
	]
}

export function buildExamStatusBreakdown(finalized: number, total: number) {
	return [
		{ name: 'Finalizadas', value: finalized },
		{ name: 'Rascunho', value: Math.max(total - finalized, 0) },
	]
}

export const STAT_ICON_STYLES = {
	users: 'bg-primary/10 text-primary',
	classrooms: 'bg-info/10 text-info',
	exams: 'bg-success/10 text-success',
	activeSessions: 'bg-warning/10 text-warning',
	subjects: 'bg-secondary text-secondary-foreground',
} as const

export const QUICK_LINKS = [
	{
		href: '/admin/usuarios',
		title: 'Usuários',
		description: 'Papéis, 2FA e último acesso.',
		icon: Users,
	},
	{
		href: '/admin/sessoes',
		title: 'Sessões',
		description: 'Dispositivos e IPs conectados.',
		icon: MonitorSmartphone,
	},
	{
		href: '/admin/atividade',
		title: 'Atividade',
		description: 'Logins e auditoria de segurança.',
		icon: Activity,
	},
] satisfies Array<{
	href: string
	title: string
	description: string
	icon: typeof Users
}>
