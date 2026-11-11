'use client'

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
	toast,
} from '@app/ui'
import { Ban, RotateCw } from 'lucide-react'
import * as React from 'react'
import {
	type AdminInvite,
	useAdminInvites,
	useResendInvite,
	useRevokeInvite,
} from '@/hooks/use-admin-access-grants'
import { toastApiError } from '@/lib/api-error-handler'
import { formatDate, formatRelativeDate } from '@/lib/date'
import { INVITE_STATUS_BADGE } from './access-grant-labels.utils'
import { ConfirmarAcaoDialog } from './confirmar-acao-dialog'
import { ConvidarProfessorDialog } from './convidar-professor-dialog'

const SKELETON_ROWS = Array.from({ length: 6 }, () => crypto.randomUUID())

export function AdminInvitesTable() {
	const { data, isLoading } = useAdminInvites()
	const resendInvite = useResendInvite()
	const revokeInvite = useRevokeInvite()
	const [revokingInvite, setRevokingInvite] =
		React.useState<AdminInvite | null>(null)
	const invites = data?.data

	function handleResend(invite: AdminInvite) {
		resendInvite.mutate(invite.id, {
			onSuccess: () => toast.success(`Convite reenviado para ${invite.email}.`),
			onError: (error) =>
				toastApiError(error, 'Não foi possível reenviar o convite.'),
		})
	}

	function handleRevoke() {
		if (!revokingInvite) return

		revokeInvite.mutate(revokingInvite.id, {
			onSuccess: () => {
				toast.success('Convite revogado.')
				setRevokingInvite(null)
			},
			onError: (error) =>
				toastApiError(error, 'Não foi possível revogar o convite.'),
		})
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						Convites
					</h1>
					<p className="text-sm text-muted-foreground">
						Convide professores para usar o plano Pro de graça por 3 meses.
					</p>
				</div>
				<ConvidarProfessorDialog />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{invites ? `${invites.length} convites` : 'Convites'}
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{isLoading ? (
						<div className="space-y-2">
							{SKELETON_ROWS.map((rowKey) => (
								<Skeleton key={rowKey} className="h-12 w-full rounded-lg" />
							))}
						</div>
					) : !invites || invites.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-8 text-center">
							<p className="text-sm text-muted-foreground">
								Nenhum convite enviado ainda.
							</p>
							<ConvidarProfessorDialog />
						</div>
					) : (
						<table className="w-full text-sm min-w-[640px]">
							<thead>
								<tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
									<th className="py-2 font-medium">E-mail</th>
									<th className="py-2 font-medium">Status</th>
									<th className="py-2 font-medium">Enviado</th>
									<th className="py-2 font-medium">Validade</th>
									<th className="py-2 font-medium text-right">Ações</th>
								</tr>
							</thead>
							<tbody>
								{invites.map((invite) => {
									const badge = INVITE_STATUS_BADGE[invite.status]
									const canResend =
										invite.status === 'pending' || invite.status === 'expired'

									return (
										<tr
											key={invite.id}
											className="border-b border-border/40 last:border-0"
										>
											<td className="py-2.5 pr-4 font-medium text-foreground">
												{invite.email}
											</td>
											<td className="py-2.5 pr-4">
												<Badge variant={badge.variant}>{badge.label}</Badge>
											</td>
											<td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
												{formatRelativeDate(invite.createdAt)}
											</td>
											<td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
												{invite.acceptedAt
													? `Aceito em ${formatDate(invite.acceptedAt, 'DD/MM/YYYY')}`
													: formatDate(invite.expiresAt, 'DD/MM/YYYY')}
											</td>
											<td className="py-2.5 text-right whitespace-nowrap">
												{canResend && (
													<>
														<Button
															size="icon-sm"
															variant="ghost"
															aria-label="Reenviar convite"
															disabled={resendInvite.isPending}
															onClick={() => handleResend(invite)}
														>
															<RotateCw />
														</Button>
														<Button
															size="icon-sm"
															variant="ghost"
															className="text-destructive hover:text-destructive"
															aria-label="Revogar convite"
															onClick={() => setRevokingInvite(invite)}
														>
															<Ban />
														</Button>
													</>
												)}
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					)}
				</CardContent>
			</Card>

			<ConfirmarAcaoDialog
				open={Boolean(revokingInvite)}
				onOpenChange={(open) => {
					if (!open) setRevokingInvite(null)
				}}
				title={`Revogar convite de ${revokingInvite?.email ?? ''}?`}
				description="O link enviado deixa de funcionar. Você pode convidar este e-mail de novo depois."
				confirmLabel="Revogar convite"
				isPending={revokeInvite.isPending}
				onConfirm={handleRevoke}
			/>
		</div>
	)
}
