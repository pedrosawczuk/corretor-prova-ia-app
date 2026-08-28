'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	toast,
} from '@app/ui'
import {
	LogOut,
	Monitor,
	MonitorSmartphone,
	ShieldAlert,
	Smartphone,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import type { AuthSession } from '@/lib/auth-server'

function parseDevice(userAgent?: string | null) {
	if (!userAgent) {
		return { label: 'Dispositivo desconhecido', isMobile: false }
	}

	const isMobile = /Mobile|Android|iPhone/i.test(userAgent)

	let browser = 'Navegador'
	if (/Edg\//.test(userAgent)) browser = 'Edge'
	else if (/Chrome\//.test(userAgent) && !/Chromium/.test(userAgent))
		browser = 'Chrome'
	else if (/Firefox\//.test(userAgent)) browser = 'Firefox'
	else if (/Safari\//.test(userAgent) && !/Chrome/.test(userAgent))
		browser = 'Safari'

	let os = ''
	if (/Windows/.test(userAgent)) os = 'Windows'
	else if (/Mac OS X/.test(userAgent)) os = 'macOS'
	else if (/Android/.test(userAgent)) os = 'Android'
	else if (/iPhone|iPad/.test(userAgent)) os = 'iOS'
	else if (/Linux/.test(userAgent)) os = 'Linux'

	return {
		label:
			[browser, os].filter(Boolean).join(' • ') || 'Navegador desconhecido',
		isMobile,
	}
}

function formatRelativeDate(iso: string) {
	const date = new Date(iso)
	const diffMs = Date.now() - date.getTime()
	const diffMinutes = Math.round(diffMs / 60_000)

	if (diffMinutes < 1) return 'agora mesmo'
	if (diffMinutes < 60) return `há ${diffMinutes} min`

	const diffHours = Math.round(diffMinutes / 60)
	if (diffHours < 24) return `há ${diffHours} h`

	const diffDays = Math.round(diffHours / 24)
	if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`

	return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

interface SessoesSectionProps {
	initialSessions: AuthSession[]
	currentToken: string
	unavailable?: boolean
}

export function SessoesSection({
	initialSessions,
	currentToken,
	unavailable = false,
}: SessoesSectionProps) {
	const [sessions, setSessions] = React.useState(initialSessions)
	const [sessionToRevoke, setSessionToRevoke] =
		React.useState<AuthSession | null>(null)
	const [confirmRevokeAll, setConfirmRevokeAll] = React.useState(false)
	const [isRevokingAll, setIsRevokingAll] = React.useState(false)
	const [isRevoking, setIsRevoking] = React.useState(false)

	const otherSessionsCount = sessions.filter(
		(s) => s.token !== currentToken,
	).length

	async function revokeSession(token: string) {
		setIsRevoking(true)

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
			const response = await fetch(`${apiUrl}/auth/revoke-session`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ token }),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				if (errorData.code === 'SESSION_NOT_FRESH') {
					toast.error(
						'Por segurança, faça login novamente para encerrar sessões.',
					)
				} else {
					toast.error('Não foi possível encerrar essa sessão.')
				}
				return
			}

			setSessions((prev) => prev.filter((s) => s.token !== token))
			toast.success('Sessão encerrada com sucesso.')
		} catch {
			toast.error(
				'Não foi possível conectar ao servidor. Verifique sua conexão.',
			)
		} finally {
			setIsRevoking(false)
			setSessionToRevoke(null)
		}
	}

	async function revokeOtherSessions() {
		setIsRevokingAll(true)

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
			const response = await fetch(`${apiUrl}/auth/revoke-other-sessions`, {
				method: 'POST',
				credentials: 'include',
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				if (errorData.code === 'SESSION_NOT_FRESH') {
					toast.error(
						'Por segurança, faça login novamente para encerrar sessões.',
					)
				} else {
					toast.error('Não foi possível encerrar as outras sessões.')
				}
				return
			}

			setSessions((prev) => prev.filter((s) => s.token === currentToken))
			toast.success('Todas as outras sessões foram encerradas.')
		} catch {
			toast.error(
				'Não foi possível conectar ao servidor. Verifique sua conexão.',
			)
		} finally {
			setIsRevokingAll(false)
			setConfirmRevokeAll(false)
		}
	}

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
				<div className="flex items-center gap-3">
					<div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
						<MonitorSmartphone className="size-4.5" />
					</div>
					<div>
						<CardTitle className="text-base">Sessões Ativas</CardTitle>
						<p className="text-xs text-muted-foreground mt-0.5">
							Dispositivos conectados à sua conta.
						</p>
					</div>
				</div>

				{otherSessionsCount > 0 && (
					<Button
						variant="outline"
						size="sm"
						isLoading={isRevokingAll}
						onClick={() => setConfirmRevokeAll(true)}
						className="shrink-0"
					>
						Encerrar outras sessões
					</Button>
				)}
			</CardHeader>

			<CardContent>
				{unavailable ? (
					<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
						<ShieldAlert className="size-6 text-warning" />
						<p className="text-sm text-muted-foreground max-w-sm">
							Por segurança, não foi possível carregar suas sessões. Faça login
							novamente para gerenciar seus dispositivos.
						</p>
						<Button variant="outline" size="sm" asChild>
							<Link href="/entrar">Entrar novamente</Link>
						</Button>
					</div>
				) : (
					<ul className="space-y-3">
						{sessions.map((session) => {
							const { label, isMobile } = parseDevice(session.userAgent)
							const isCurrent = session.token === currentToken
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
													{label}
												</span>
												{isCurrent && (
													<Badge variant="success-outline" size="xs">
														Sessão atual
													</Badge>
												)}
											</div>
											<p className="text-xs text-muted-foreground truncate">
												{session.ipAddress ?? 'IP desconhecido'} • Ativa{' '}
												{formatRelativeDate(session.updatedAt)}
											</p>
										</div>
									</div>

									{!isCurrent && (
										<Button
											variant="destructive-outline"
											size="icon-sm"
											aria-label="Encerrar sessão"
											onClick={() => setSessionToRevoke(session)}
											className="shrink-0"
										>
											<LogOut className="size-4" />
										</Button>
									)}
								</li>
							)
						})}
					</ul>
				)}
			</CardContent>

			<AlertDialog
				open={sessionToRevoke !== null}
				onOpenChange={(open) => !open && setSessionToRevoke(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia variant="destructive">
							<LogOut />
						</AlertDialogMedia>
						<AlertDialogTitle>Encerrar esta sessão?</AlertDialogTitle>
						<AlertDialogDescription>
							O dispositivo será desconectado imediatamente e precisará fazer
							login novamente para acessar a conta.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isRevoking}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={isRevoking}
							onClick={(e) => {
								e.preventDefault()
								if (sessionToRevoke) revokeSession(sessionToRevoke.token)
							}}
						>
							Encerrar Sessão
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={confirmRevokeAll} onOpenChange={setConfirmRevokeAll}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia variant="destructive">
							<MonitorSmartphone />
						</AlertDialogMedia>
						<AlertDialogTitle>Encerrar outras sessões?</AlertDialogTitle>
						<AlertDialogDescription>
							Todos os outros dispositivos conectados à sua conta serão
							desconectados. Apenas esta sessão continuará ativa.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isRevokingAll}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={isRevokingAll}
							onClick={(e) => {
								e.preventDefault()
								revokeOtherSessions()
							}}
						>
							Encerrar Outras Sessões
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	)
}
