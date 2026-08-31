'use client'

import dayjs from '@app/dayjs'
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from '@app/ui'
import {
	ArrowRight,
	BookOpen,
	Clock,
	FileText,
	LayoutDashboard,
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
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { useClassrooms } from '@/hooks/use-classrooms'
import { useAllExams } from '@/hooks/use-exams'
import { useSubjectNameMap } from '@/hooks/use-subjects'
import { formatRelativeDate } from '@/lib/date'
import { buildGrowthData, buildSubjectData } from './dashboard-overview.utils'
import { OnboardingTour } from './onboarding-tour'

export function DashboardOverview() {
	const { data: classrooms, isLoading, isError } = useClassrooms()
	const subjectNameById = useSubjectNameMap()

	const subjectData = React.useMemo(
		() => buildSubjectData(classrooms ?? [], subjectNameById),
		[classrooms, subjectNameById],
	)

	const growthData = React.useMemo(
		() => buildGrowthData(classrooms ?? []),
		[classrooms],
	)

	const recentTurmas = React.useMemo(
		() =>
			[...(classrooms ?? [])]
				.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
				.slice(0, 3),
		[classrooms],
	)

	const totalTurmas = classrooms?.length ?? 0
	const totalMaterias = new Set((classrooms ?? []).map((c) => c.subjectId)).size

	const classroomIds = React.useMemo(
		() => (classrooms ?? []).map((c) => c.id),
		[classrooms],
	)
	const { exams, isLoading: isProvasLoading } = useAllExams(classroomIds)
	const totalProvas = exams.length

	const classroomsById = React.useMemo(
		() => new Map((classrooms ?? []).map((c) => [c.id, c])),
		[classrooms],
	)

	const recentProvas = React.useMemo(
		() =>
			[...exams]
				.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
				.slice(0, 3),
		[exams],
	)

	if (isError) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
				<p className="text-sm text-muted-foreground">
					Não foi possível carregar o dashboard. Tente recarregar a página.
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<OnboardingTour />

			<div>
				<h1 className="text-xl font-bold tracking-tight text-foreground">
					Dashboard
				</h1>
				<p className="text-sm text-muted-foreground">
					Acompanhe suas turmas e provas em um só lugar.
				</p>
			</div>

			<div data-tour="stats" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="flex items-center gap-3 pt-4 sm:pt-6">
						<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
							<Users className="size-5" />
						</div>
						<div>
							{isLoading ? (
								<Skeleton className="h-7 w-10" />
							) : (
								<p className="text-2xl font-bold tracking-tight text-foreground">
									{totalTurmas}
								</p>
							)}
							<p className="text-xs text-muted-foreground">Turmas</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center gap-3 pt-4 sm:pt-6">
						<div className="size-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
							<BookOpen className="size-5" />
						</div>
						<div>
							{isLoading ? (
								<Skeleton className="h-7 w-10" />
							) : (
								<p className="text-2xl font-bold tracking-tight text-foreground">
									{totalMaterias}
								</p>
							)}
							<p className="text-xs text-muted-foreground">Matérias</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center gap-3 pt-4 sm:pt-6">
						<div className="size-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
							<FileText className="size-5" />
						</div>
						<div>
							{isLoading || isProvasLoading ? (
								<Skeleton className="h-7 w-10" />
							) : (
								<p className="text-2xl font-bold tracking-tight text-foreground">
									{totalProvas}
								</p>
							)}
							<p className="text-xs text-muted-foreground">Provas</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Turmas por matéria</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full rounded-xl" />
						) : subjectData.length === 0 ? (
							<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
								Crie turmas para ver o resumo por matéria.
							</div>
						) : (
							<ResponsiveContainer width="100%" height={256}>
								<BarChart
									data={subjectData}
									margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
									barCategoryGap="30%"
								>
									<CartesianGrid
										vertical={false}
										stroke="var(--color-border)"
									/>
									<XAxis
										dataKey="subject"
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
										cursor={{ fill: 'var(--color-muted)' }}
										content={(props) => (
											<ChartTooltip {...props} suffix="turma(s)" />
										)}
									/>
									<Bar
										dataKey="count"
										fill="var(--color-primary)"
										radius={[4, 4, 0, 0]}
										maxBarSize={48}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Crescimento de turmas</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height={256}>
								<AreaChart
									data={growthData}
									margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
								>
									<defs>
										<linearGradient
											id="growthGradient"
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
										dataKey="month"
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
										cursor={{
											stroke: 'var(--color-border)',
											strokeWidth: 1,
										}}
										content={(props) => (
											<ChartTooltip {...props} suffix="turma(s)" />
										)}
									/>
									<Area
										type="monotone"
										dataKey="total"
										stroke="var(--color-primary)"
										strokeWidth={2}
										fill="url(#growthGradient)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>
			</div>

			<Card data-tour="turmas-section">
				<CardHeader>
					<CardTitle>
						Turmas
						<Button
							variant="ghost"
							size="sm"
							asChild
							rightIcon={<ArrowRight />}
						>
							<Link href="/dashboard/turmas">Ver todas</Link>
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<Skeleton className="h-24 rounded-xl" />
							<Skeleton className="h-24 rounded-xl" />
							<Skeleton className="h-24 rounded-xl" />
						</div>
					) : recentTurmas.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
							<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
								<LayoutDashboard className="size-6" />
							</div>
							<h2 className="text-sm font-semibold text-foreground">
								Nenhuma turma criada ainda
							</h2>
							<p className="max-w-sm text-xs text-muted-foreground">
								Crie sua primeira turma para começar a organizar provas.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							{recentTurmas.map((classroom) => (
								<Link
									key={classroom.id}
									href={`/dashboard/turmas/${classroom.id}`}
								>
									<Card variant="subtle" interactive className="h-full">
										<CardContent className="flex flex-col gap-2 pt-4 sm:pt-6">
											<div className="flex items-center justify-between gap-2">
												<div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
													<Users className="size-4" />
												</div>
												<Badge variant="subtle" size="sm">
													{subjectNameById.get(classroom.subjectId) ?? '—'}
												</Badge>
											</div>
											<p className="text-sm font-semibold text-foreground truncate">
												{classroom.name}
											</p>
											<p className="flex items-center gap-1 text-xs text-muted-foreground">
												<Clock className="size-3" />
												{formatRelativeDate(classroom.createdAt)}
											</p>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Card data-tour="provas-section">
				<CardHeader>
					<CardTitle>
						Provas
						<Button
							variant="ghost"
							size="sm"
							asChild
							rightIcon={<ArrowRight />}
						>
							<Link href="/dashboard/turmas">Ver todas</Link>
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading || isProvasLoading ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<Skeleton className="h-24 rounded-xl" />
							<Skeleton className="h-24 rounded-xl" />
							<Skeleton className="h-24 rounded-xl" />
						</div>
					) : recentProvas.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
							<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
								<FileText className="size-6" />
							</div>
							<h2 className="text-sm font-semibold text-foreground">
								Nenhuma prova criada ainda
							</h2>
							<p className="max-w-sm text-xs text-muted-foreground">
								Gere provas com a IA do Gabarita.app a partir de cada turma.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							{recentProvas.map((exam) => (
								<Link
									key={exam.id}
									href={`/dashboard/turmas/${exam.classroomId}/provas/${exam.id}`}
								>
									<Card variant="subtle" interactive className="h-full">
										<CardContent className="flex flex-col gap-2 pt-4 sm:pt-6">
											<div className="flex items-center justify-between gap-2">
												<div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
													<FileText className="size-4" />
												</div>
												<Badge variant="subtle" size="sm">
													{classroomsById.get(exam.classroomId)?.name ??
														'Turma'}
												</Badge>
											</div>
											<p className="text-sm font-semibold text-foreground truncate">
												{exam.title}
											</p>
											<p className="flex items-center gap-1 text-xs text-muted-foreground">
												<Clock className="size-3" />
												{formatRelativeDate(exam.createdAt)}
											</p>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
