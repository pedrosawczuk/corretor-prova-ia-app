'use client'

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@app/ui'
import {
	Activity,
	ArrowRight,
	BookOpen,
	FileText,
	Layers,
	ShieldCheck,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { useAdminOverview } from '@/hooks/use-admin'
import {
	buildExamStatusBreakdown,
	buildExamsPerDay,
	buildSignupsPerDay,
	buildTwoFactorBreakdown,
	EXAM_STATUS_CHART_COLORS,
	EXAMS_HISTORY_DAYS,
	QUICK_LINKS,
	SIGNUP_HISTORY_DAYS,
	STAT_ICON_STYLES,
	TWO_FACTOR_CHART_COLORS,
} from './admin-overview.utils'
import { StatCard } from './stat-card'

export function AdminOverview() {
	const { data: overview, isLoading } = useAdminOverview()

	const twoFactorAdoption =
		overview && overview.totalUsers > 0
			? Math.round((overview.twoFactorEnabledUsers / overview.totalUsers) * 100)
			: 0

	const finalizedExamsShare =
		overview && overview.totalExams > 0
			? Math.round((overview.finalizedExams / overview.totalExams) * 100)
			: 0

	const signupsPerDay = React.useMemo(
		() => buildSignupsPerDay(overview?.usersCreatedAt ?? []),
		[overview],
	)

	const examsPerDay = React.useMemo(
		() => buildExamsPerDay(overview?.examsCreatedAt ?? []),
		[overview],
	)

	const twoFactorBreakdown = React.useMemo(
		() =>
			buildTwoFactorBreakdown(
				overview?.twoFactorEnabledUsers ?? 0,
				overview?.totalUsers ?? 0,
			),
		[overview],
	)

	const examStatusBreakdown = React.useMemo(
		() =>
			buildExamStatusBreakdown(
				overview?.finalizedExams ?? 0,
				overview?.totalExams ?? 0,
			),
		[overview],
	)

	const topSubjects = overview?.topSubjects ?? []

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-foreground">
					Visão Geral
				</h1>
				<p className="text-sm text-muted-foreground">
					Resumo de usuários, atividade e segurança da plataforma.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
				<StatCard
					icon={Users}
					iconStyle={STAT_ICON_STYLES.users}
					value={overview?.totalUsers ?? 0}
					label="Usuários"
					isLoading={isLoading}
				/>
				<StatCard
					icon={BookOpen}
					iconStyle={STAT_ICON_STYLES.classrooms}
					value={overview?.totalClassrooms ?? 0}
					label="Turmas"
					isLoading={isLoading}
				/>
				<StatCard
					icon={FileText}
					iconStyle={STAT_ICON_STYLES.exams}
					value={overview?.totalExams ?? 0}
					label="Provas"
					isLoading={isLoading}
				/>
				<StatCard
					icon={Layers}
					iconStyle={STAT_ICON_STYLES.subjects}
					value={overview?.totalSubjects ?? 0}
					label="Matérias"
					isLoading={isLoading}
				/>
				<StatCard
					icon={Activity}
					iconStyle={STAT_ICON_STYLES.activeSessions}
					value={overview?.activeSessionsUsers ?? 0}
					label="Usuários com sessão ativa"
					isLoading={isLoading}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>
							Novos usuários nos últimos {SIGNUP_HISTORY_DAYS} dias
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height={256}>
								<AreaChart
									data={signupsPerDay}
									margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
								>
									<defs>
										<linearGradient
											id="signupsGradient"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="0%"
												stopColor="var(--color-primary)"
												stopOpacity={0.25}
											/>
											<stop
												offset="100%"
												stopColor="var(--color-primary)"
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										vertical={false}
										stroke="var(--color-border)"
									/>
									<XAxis
										dataKey="day"
										tickLine={false}
										axisLine={false}
										interval={6}
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
											<ChartTooltip {...props} suffix="usuário(s)" />
										)}
									/>
									<Area
										type="monotone"
										dataKey="total"
										stroke="var(--color-primary)"
										strokeWidth={2}
										fill="url(#signupsGradient)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex-row items-center gap-3 space-y-0">
						<div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
							<ShieldCheck className="size-4.5" />
						</div>
						<div>
							<CardTitle className="text-base">
								Verificação em duas etapas
							</CardTitle>
							<p className="text-xs text-muted-foreground mt-0.5">
								{isLoading
									? 'Carregando...'
									: `${overview?.twoFactorEnabledUsers ?? 0} de ${overview?.totalUsers ?? 0} usuários`}
							</p>
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full rounded-xl" />
						) : (
							<div className="relative">
								<ResponsiveContainer width="100%" height={256}>
									<PieChart>
										<Pie
											data={twoFactorBreakdown}
											dataKey="value"
											nameKey="name"
											innerRadius={70}
											outerRadius={100}
											paddingAngle={2}
											startAngle={90}
											endAngle={-270}
										>
											{twoFactorBreakdown.map((entry, index) => (
												<Cell
													key={entry.name}
													fill={
														TWO_FACTOR_CHART_COLORS[
															index % TWO_FACTOR_CHART_COLORS.length
														]
													}
												/>
											))}
										</Pie>
										<RechartsTooltip
											content={(props) => (
												<ChartTooltip {...props} suffix="usuário(s)" />
											)}
										/>
									</PieChart>
								</ResponsiveContainer>
								<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
									<span className="text-2xl font-bold tracking-tight text-foreground">
										{twoFactorAdoption}%
									</span>
									<span className="text-xs text-muted-foreground">com 2FA</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>
							Provas criadas nos últimos {EXAMS_HISTORY_DAYS} dias
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height={256}>
								<AreaChart
									data={examsPerDay}
									margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
								>
									<defs>
										<linearGradient
											id="examsGradient"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="0%"
												stopColor="var(--color-success)"
												stopOpacity={0.25}
											/>
											<stop
												offset="100%"
												stopColor="var(--color-success)"
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										vertical={false}
										stroke="var(--color-border)"
									/>
									<XAxis
										dataKey="day"
										tickLine={false}
										axisLine={false}
										interval={6}
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
											<ChartTooltip {...props} suffix="prova(s)" />
										)}
									/>
									<Area
										type="monotone"
										dataKey="total"
										stroke="var(--color-success)"
										strokeWidth={2}
										fill="url(#examsGradient)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex-row items-center gap-3 space-y-0">
						<div className="size-9 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
							<FileText className="size-4.5" />
						</div>
						<div>
							<CardTitle className="text-base">Provas finalizadas</CardTitle>
							<p className="text-xs text-muted-foreground mt-0.5">
								{isLoading
									? 'Carregando...'
									: `${overview?.finalizedExams ?? 0} de ${overview?.totalExams ?? 0} provas`}
							</p>
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full rounded-xl" />
						) : (
							<div className="relative">
								<ResponsiveContainer width="100%" height={256}>
									<PieChart>
										<Pie
											data={examStatusBreakdown}
											dataKey="value"
											nameKey="name"
											innerRadius={70}
											outerRadius={100}
											paddingAngle={2}
											startAngle={90}
											endAngle={-270}
										>
											{examStatusBreakdown.map((entry, index) => (
												<Cell
													key={entry.name}
													fill={
														EXAM_STATUS_CHART_COLORS[
															index % EXAM_STATUS_CHART_COLORS.length
														]
													}
												/>
											))}
										</Pie>
										<RechartsTooltip
											content={(props) => (
												<ChartTooltip {...props} suffix="prova(s)" />
											)}
										/>
									</PieChart>
								</ResponsiveContainer>
								<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
									<span className="text-2xl font-bold tracking-tight text-foreground">
										{finalizedExamsShare}%
									</span>
									<span className="text-xs text-muted-foreground">
										finalizadas
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Matérias mais usadas</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-64 w-full rounded-xl" />
					) : topSubjects.length === 0 ? (
						<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
							Nenhuma turma ou prova associada a uma matéria ainda.
						</div>
					) : (
						<ResponsiveContainer
							width="100%"
							height={Math.max(topSubjects.length * 44, 128)}
						>
							<BarChart
								data={topSubjects}
								layout="vertical"
								margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
								barCategoryGap="30%"
							>
								<CartesianGrid
									horizontal={false}
									stroke="var(--color-border)"
								/>
								<XAxis
									type="number"
									allowDecimals={false}
									tickLine={false}
									axisLine={false}
									tick={{
										fill: 'var(--color-muted-foreground)',
										fontSize: 12,
									}}
								/>
								<YAxis
									type="category"
									dataKey="subject"
									tickLine={false}
									axisLine={false}
									width={140}
									tick={{
										fill: 'var(--color-foreground)',
										fontSize: 12,
									}}
								/>
								<RechartsTooltip
									cursor={{ fill: 'var(--color-muted)' }}
									content={(props) => (
										<ChartTooltip {...props} suffix="prova(s)" />
									)}
								/>
								<Bar
									dataKey="examsCount"
									name="Provas"
									fill="var(--color-primary)"
									radius={[0, 4, 4, 0]}
									maxBarSize={24}
								/>
							</BarChart>
						</ResponsiveContainer>
					)}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{QUICK_LINKS.map((link) => (
					<Link key={link.href} href={link.href}>
						<Card variant="subtle" interactive className="h-full">
							<CardContent className="flex flex-col gap-2 pt-4 sm:pt-6">
								<div className="flex items-center justify-between gap-2">
									<div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
										<link.icon className="size-4" />
									</div>
									<ArrowRight className="size-4 text-muted-foreground" />
								</div>
								<p className="text-sm font-semibold text-foreground">
									{link.title}
								</p>
								<p className="text-xs text-muted-foreground">
									{link.description}
								</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
