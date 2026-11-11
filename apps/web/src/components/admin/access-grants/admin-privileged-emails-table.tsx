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
import { Trash2 } from 'lucide-react'
import * as React from 'react'
import {
	type AdminPrivilegedEmail,
	useAdminPrivilegedEmails,
	useDeletePrivilegedEmail,
} from '@/hooks/use-admin-access-grants'
import { toastApiError } from '@/lib/api-error-handler'
import { formatDate, formatRelativeDate } from '@/lib/date'
import { AdicionarEmailPrivilegiadoDialog } from './adicionar-email-privilegiado-dialog'
import { ConfirmarAcaoDialog } from './confirmar-acao-dialog'

const SKELETON_ROWS = Array.from({ length: 6 }, () => crypto.randomUUID())

export function AdminPrivilegedEmailsTable() {
	const { data, isLoading } = useAdminPrivilegedEmails()
	const deletePrivilegedEmail = useDeletePrivilegedEmail()
	const [removingEmail, setRemovingEmail] =
		React.useState<AdminPrivilegedEmail | null>(null)
	const privilegedEmails = data?.data

	function handleRemove() {
		if (!removingEmail) return

		deletePrivilegedEmail.mutate(removingEmail.id, {
			onSuccess: () => {
				toast.success('E-mail removido dos privilegiados.')
				setRemovingEmail(null)
			},
			onError: (error) =>
				toastApiError(error, 'Não foi possível remover o e-mail.'),
		})
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						E-mails privilegiados
					</h1>
					<p className="text-sm text-muted-foreground">
						Esses e-mails ganham 3 meses do Pro automaticamente ao entrar, sem
						precisar de convite.
					</p>
				</div>
				<AdicionarEmailPrivilegiadoDialog />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{privilegedEmails
							? `${privilegedEmails.length} e-mails`
							: 'E-mails privilegiados'}
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{isLoading ? (
						<div className="space-y-2">
							{SKELETON_ROWS.map((rowKey) => (
								<Skeleton key={rowKey} className="h-12 w-full rounded-lg" />
							))}
						</div>
					) : !privilegedEmails || privilegedEmails.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-8 text-center">
							<p className="text-sm text-muted-foreground">
								Nenhum e-mail privilegiado cadastrado.
							</p>
							<AdicionarEmailPrivilegiadoDialog />
						</div>
					) : (
						<table className="w-full text-sm min-w-[640px]">
							<thead>
								<tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
									<th className="py-2 font-medium">E-mail</th>
									<th className="py-2 font-medium">Observação</th>
									<th className="py-2 font-medium">Cortesia</th>
									<th className="py-2 font-medium">Adicionado</th>
									<th className="py-2 font-medium text-right">Ações</th>
								</tr>
							</thead>
							<tbody>
								{privilegedEmails.map((privilegedEmail) => (
									<tr
										key={privilegedEmail.id}
										className="border-b border-border/40 last:border-0"
									>
										<td className="py-2.5 pr-4 font-medium text-foreground">
											{privilegedEmail.email}
										</td>
										<td className="py-2.5 pr-4 text-muted-foreground">
											{privilegedEmail.note ?? '—'}
										</td>
										<td className="py-2.5 pr-4 whitespace-nowrap">
											{privilegedEmail.claimedAt ? (
												<Badge variant="success-outline">
													Usada em{' '}
													{formatDate(privilegedEmail.claimedAt, 'DD/MM/YYYY')}
												</Badge>
											) : (
												<Badge variant="subtle">Aguardando login</Badge>
											)}
										</td>
										<td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
											{formatRelativeDate(privilegedEmail.createdAt)}
										</td>
										<td className="py-2.5 text-right">
											<Button
												size="icon-sm"
												variant="ghost"
												className="text-destructive hover:text-destructive"
												aria-label="Remover e-mail privilegiado"
												onClick={() => setRemovingEmail(privilegedEmail)}
											>
												<Trash2 />
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent>
			</Card>

			<ConfirmarAcaoDialog
				open={Boolean(removingEmail)}
				onOpenChange={(open) => {
					if (!open) setRemovingEmail(null)
				}}
				title={`Remover ${removingEmail?.email ?? ''}?`}
				description="O e-mail deixa de ganhar a cortesia ao entrar. Uma cortesia que já foi usada continua valendo; para encerrá-la, revogue em Cortesias."
				confirmLabel="Remover"
				isPending={deletePrivilegedEmail.isPending}
				onConfirm={handleRemove}
			/>
		</div>
	)
}
