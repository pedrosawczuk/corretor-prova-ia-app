'use client'

import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from '@app/ui'
import { Monitor, Smartphone } from 'lucide-react'
import { useAdminSessions } from '@/hooks/use-admin'
import { formatRelativeDate } from '@/lib/date'
import { parseDevice } from '@/lib/device'

const SKELETON_ROWS = Array.from({ length: 6 }, () => crypto.randomUUID())

export function AdminSessionsTable() {
	const { data: sessions, isLoading } = useAdminSessions()

	const activeCount = sessions?.filter((s) => s.isActive).length ?? 0

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-foreground">
					Sessões
				</h1>
				<p className="text-sm text-muted-foreground">
					Dispositivos e IPs conectados à plataforma.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{isLoading
							? 'Sessões'
							: `${activeCount} ativas de ${sessions?.length ?? 0} recentes`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-2">
							{SKELETON_ROWS.map((rowKey) => (
								<Skeleton key={rowKey} className="h-14 w-full rounded-xl" />
							))}
						</div>
					) : !sessions || sessions.length === 0 ? (
						<p className="text-sm text-muted-foreground py-6 text-center">
							Nenhuma sessão registrada ainda.
						</p>
					) : (
						<ul className="space-y-2">
							{sessions.map((session) => {
								const { label, isMobile } = parseDevice(session.userAgent)
								const DeviceIcon = isMobile ? Smartphone : Monitor

								return (
									<li
										key={session.id}
										className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3 sm:p-4"
									>
										<div className="flex items-center gap-3 min-w-0">
											<div className="size-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
												<DeviceIcon className="size-4.5" />
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="text-sm font-semibold text-foreground truncate">
														{session.userName}
													</span>
													<Badge
														variant={
															session.isActive ? 'success-outline' : 'subtle'
														}
														size="xs"
													>
														{session.isActive ? 'Ativa' : 'Expirada'}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground truncate">
													{session.userEmail} • {label} •{' '}
													{session.ipAddress ?? 'IP desconhecido'}
												</p>
											</div>
										</div>

										<span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
											{formatRelativeDate(session.createdAt)}
										</span>
									</li>
								)
							})}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
