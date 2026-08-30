'use client'

import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from '@app/ui'
import { useAdminUsers } from '@/hooks/use-admin'
import { formatRelativeDate } from '@/lib/date'

export function AdminUsersTable() {
	const { data: users, isLoading } = useAdminUsers()

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-foreground">
					Usuários
				</h1>
				<p className="text-sm text-muted-foreground">
					Papéis, verificação em duas etapas e atividade de cada conta.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{users ? `${users.length} usuários` : 'Usuários'}
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{isLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 6 }).map((_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
								<Skeleton key={index} className="h-12 w-full rounded-lg" />
							))}
						</div>
					) : !users || users.length === 0 ? (
						<p className="text-sm text-muted-foreground py-6 text-center">
							Nenhum usuário encontrado.
						</p>
					) : (
						<table className="w-full text-sm min-w-[760px]">
							<thead>
								<tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
									<th className="py-2 font-medium">Usuário</th>
									<th className="py-2 font-medium">Papel</th>
									<th className="py-2 font-medium">2FA</th>
									<th className="py-2 font-medium">Turmas</th>
									<th className="py-2 font-medium">Provas</th>
									<th className="py-2 font-medium">Último acesso</th>
									<th className="py-2 font-medium">Criado em</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr
										key={user.id}
										className="border-b border-border/40 last:border-0"
									>
										<td className="py-2.5 pr-4">
											<p className="font-medium text-foreground truncate max-w-[220px]">
												{user.name}
											</p>
											<p className="text-xs text-muted-foreground truncate max-w-[220px]">
												{user.email}
											</p>
										</td>
										<td className="py-2.5 pr-4">
											<Badge
												variant={user.role === 'admin' ? 'default' : 'subtle'}
												size="sm"
											>
												{user.role === 'admin' ? 'Admin' : 'Usuário'}
											</Badge>
											{user.banned && (
												<Badge
													variant="destructive-outline"
													size="sm"
													className="ml-1.5"
												>
													Banido
												</Badge>
											)}
										</td>
										<td className="py-2.5 pr-4">
											<Badge
												variant={
													user.twoFactorEnabled
														? 'success-outline'
														: 'warning-outline'
												}
												size="sm"
											>
												{user.twoFactorEnabled ? 'Ativo' : 'Inativo'}
											</Badge>
										</td>
										<td className="py-2.5 pr-4 text-foreground">
											{user.classroomsCount}
										</td>
										<td className="py-2.5 pr-4 text-foreground">
											{user.examsCount}
										</td>
										<td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
											{user.lastSeenAt
												? formatRelativeDate(user.lastSeenAt)
												: 'nunca'}
										</td>
										<td className="py-2.5 text-muted-foreground whitespace-nowrap">
											{formatRelativeDate(user.createdAt)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
