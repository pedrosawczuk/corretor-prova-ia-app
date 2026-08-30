'use client'

import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from '@app/ui'
import * as React from 'react'
import {
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { useAdminAuditLogs, useAdminSessions } from '@/hooks/use-admin'
import { formatRelativeDate } from '@/lib/date'
import { parseDevice } from '@/lib/device'
import {
	buildLoginsPerDay,
	DEVICE_CHART_COLORS,
	LOGIN_HISTORY_DAYS,
	outcomeBadgeVariant,
} from './admin-activity-charts.utils'

const AUDIT_SKELETON_ROWS = Array.from({ length: 4 }, () => crypto.randomUUID())

export function AdminActivityCharts() {
	const { data: sessions, isLoading: isSessionsLoading } = useAdminSessions()
	const { data: auditLogs, isLoading: isAuditLogsLoading } = useAdminAuditLogs()

	const loginsPerDay = React.useMemo(
		() => buildLoginsPerDay((sessions ?? []).map((s) => s.createdAt)),
		[sessions],
	)

	const deviceBreakdown = React.useMemo(() => {
		let mobile = 0
		let desktop = 0

		for (const session of sessions ?? []) {
			if (parseDevice(session.userAgent).isMobile) mobile++
			else desktop++
		}

		return [
			{ name: 'Desktop', value: desktop },
			{ name: 'Mobile', value: mobile },
		]
	}, [sessions])

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-foreground">
					Atividade
				</h1>
				<p className="text-sm text-muted-foreground">
					Logins ao longo do tempo e auditoria de segurança.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Logins nos últimos {LOGIN_HISTORY_DAYS} dias</CardTitle>
					</CardHeader>
					<CardContent>
						{isSessionsLoading ? (
							<Skeleton className="h-64 w-full rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height={256}>
								<LineChart
									data={loginsPerDay}
									margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
								>
									<CartesianGrid
										vertical={false}
										stroke="var(--color-border)"
									/>
									<XAxis
										dataKey="day"
										tickLine={false}
										axisLine={false}
										tick={{
											fill: 'var(--color-muted-foreground)',
											fontSize: 12,
										}}
									/>
									<YAxis
										allowDecimals={false}
										tickLine={false}
										axisLine={false}
										tick={{
											fill: 'var(--color-muted-foreground)',
											fontSize: 12,
										}}
									/>
									<RechartsTooltip
										cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
										content={(props) => (
											<ChartTooltip {...props} suffix="login(s)" />
										)}
									/>
									<Line
										type="monotone"
										dataKey="total"
										stroke="var(--color-primary)"
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Dispositivos</CardTitle>
					</CardHeader>
					<CardContent>
						{isSessionsLoading ? (
							<Skeleton className="h-64 w-full rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height={256}>
								<PieChart>
									<Pie
										data={deviceBreakdown}
										dataKey="value"
										nameKey="name"
										innerRadius={50}
										outerRadius={80}
										paddingAngle={2}
									>
										{deviceBreakdown.map((entry, index) => (
											<Cell
												key={entry.name}
												fill={
													DEVICE_CHART_COLORS[
														index % DEVICE_CHART_COLORS.length
													]
												}
											/>
										))}
									</Pie>
									<RechartsTooltip
										content={(props) => (
											<ChartTooltip {...props} suffix="sessão(ões)" />
										)}
									/>
								</PieChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Auditoria de segurança</CardTitle>
				</CardHeader>
				<CardContent>
					{isAuditLogsLoading ? (
						<div className="space-y-2">
							{AUDIT_SKELETON_ROWS.map((rowKey) => (
								<Skeleton key={rowKey} className="h-12 w-full rounded-lg" />
							))}
						</div>
					) : !auditLogs || auditLogs.length === 0 ? (
						<p className="text-sm text-muted-foreground py-6 text-center">
							Nenhuma atividade de auditoria registrada ainda.
						</p>
					) : (
						<ul className="space-y-2">
							{auditLogs.map((log) => (
								<li
									key={log.id}
									className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3"
								>
									<div className="min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="text-sm font-medium text-foreground">
												{log.action}
											</span>
											<Badge
												variant={outcomeBadgeVariant(log.outcome)}
												size="xs"
											>
												{log.outcome === 'success' ? 'sucesso' : 'falha'}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground truncate">
											{log.actorEmail ?? 'desconhecido'} • {log.httpMethod}{' '}
											{log.httpPath} • {log.ipAddress ?? 'IP desconhecido'}
										</p>
									</div>
									<span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
										{formatRelativeDate(log.createdAt)}
									</span>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
