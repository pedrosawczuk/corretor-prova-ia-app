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
import { Ban } from 'lucide-react'
import * as React from 'react'
import {
	type AdminAccessGrant,
	useAdminAccessGrants,
	useRevokeAccessGrant,
} from '@/hooks/use-admin-access-grants'
import { toastApiError } from '@/lib/api-error-handler'
import { formatDate } from '@/lib/date'
import {
	ACCESS_GRANT_SOURCE_LABEL,
	ACCESS_GRANT_STATUS_BADGE,
} from './access-grant-labels.utils'
import { ConfirmarAcaoDialog } from './confirmar-acao-dialog'

const SKELETON_ROWS = Array.from({ length: 6 }, () => crypto.randomUUID())

export function AdminAccessGrantsTable() {
	const { data, isLoading } = useAdminAccessGrants()
	const revokeAccessGrant = useRevokeAccessGrant()
	const [revokingGrant, setRevokingGrant] =
		React.useState<AdminAccessGrant | null>(null)
	const grants = data?.data
	const activeCount = grants?.filter(
		(grant) => grant.status === 'active',
	).length

	function handleRevoke() {
		if (!revokingGrant) return

		revokeAccessGrant.mutate(revokingGrant.id, {
			onSuccess: () => {
				toast.success('Cortesia revogada.')
				setRevokingGrant(null)
			},
			onError: (error) =>
				toastApiError(error, 'Não foi possível revogar a cortesia.'),
		})
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-foreground">
					Cortesias
				</h1>
				<p className="text-sm text-muted-foreground">
					Professores que usam ou usaram o plano Pro de graça.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{grants
							? `${activeCount} ativas de ${grants.length} cortesias`
							: 'Cortesias'}
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{isLoading ? (
						<div className="space-y-2">
							{SKELETON_ROWS.map((rowKey) => (
								<Skeleton key={rowKey} className="h-12 w-full rounded-lg" />
							))}
						</div>
					) : !grants || grants.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							Nenhuma cortesia concedida ainda. Elas aparecem aqui quando um
							professor convidado ou privilegiado entra na plataforma.
						</p>
					) : (
						<table className="w-full text-sm min-w-[720px]">
							<thead>
								<tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
									<th className="py-2 font-medium">Professor</th>
									<th className="py-2 font-medium">Origem</th>
									<th className="py-2 font-medium">Status</th>
									<th className="py-2 font-medium">Período</th>
									<th className="py-2 font-medium text-right">Ações</th>
								</tr>
							</thead>
							<tbody>
								{grants.map((grant) => {
									const badge = ACCESS_GRANT_STATUS_BADGE[grant.status]

									return (
										<tr
											key={grant.id}
											className="border-b border-border/40 last:border-0"
										>
											<td className="py-2.5 pr-4">
												<p className="font-medium text-foreground">
													{grant.userName}
												</p>
												<p className="text-xs text-muted-foreground">
													{grant.userEmail}
												</p>
											</td>
											<td className="py-2.5 pr-4 text-muted-foreground">
												{ACCESS_GRANT_SOURCE_LABEL[grant.source]}
											</td>
											<td className="py-2.5 pr-4">
												<Badge variant={badge.variant}>{badge.label}</Badge>
											</td>
											<td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
												{formatDate(grant.startsAt, 'DD/MM/YYYY')} até{' '}
												{formatDate(grant.expiresAt, 'DD/MM/YYYY')}
											</td>
											<td className="py-2.5 text-right">
												{grant.status === 'active' && (
													<Button
														size="icon-sm"
														variant="ghost"
														className="text-destructive hover:text-destructive"
														aria-label="Revogar cortesia"
														onClick={() => setRevokingGrant(grant)}
													>
														<Ban />
													</Button>
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
				open={Boolean(revokingGrant)}
				onOpenChange={(open) => {
					if (!open) setRevokingGrant(null)
				}}
				title={`Revogar a cortesia de ${revokingGrant?.userName ?? ''}?`}
				description="O professor perde o acesso ao Pro imediatamente e volta para o plano gratuito. Essa ação não pode ser desfeita."
				confirmLabel="Revogar cortesia"
				isPending={revokeAccessGrant.isPending}
				onConfirm={handleRevoke}
			/>
		</div>
	)
}
