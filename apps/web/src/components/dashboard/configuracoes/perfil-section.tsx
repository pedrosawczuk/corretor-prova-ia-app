'use client'

import { updateProfileSchema } from '@app/shared'
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	toast,
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeCheck, Mail, Save, ShieldAlert, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { applyApiErrorsToForm } from '@/lib/api-error-handler'
import type { AuthUser } from '@/lib/auth-server'
import { formatDate } from '@/lib/date'

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/)
	const first = parts[0]?.[0] ?? ''
	const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
	return (first + last).toUpperCase() || 'U'
}

export function PerfilSection({ user }: { user: AuthUser }) {
	const router = useRouter()
	const [isLoading, setIsLoading] = React.useState(false)

	const form = useForm<UpdateProfileInput>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user.name,
		},
	})

	async function onSubmit(data: UpdateProfileInput) {
		if (data.name === user.name) return

		setIsLoading(true)

		try {
			await apiClient('/auth/update-profile', {
				method: 'POST',
				body: JSON.stringify({ name: data.name }),
			})

			toast.success('Perfil atualizado com sucesso!')
			router.refresh()
		} catch (error) {
			applyApiErrorsToForm(
				error,
				form.setError,
				'Não foi possível atualizar seu perfil. Tente novamente.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	const memberSince = formatDate(user.createdAt)

	return (
		<Card>
			<CardHeader className="flex-row items-center gap-3 space-y-0">
				<div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
					<User className="size-4.5" />
				</div>
				<div>
					<CardTitle className="text-base">Perfil</CardTitle>
					<p className="text-xs text-muted-foreground mt-0.5">
						Informações públicas da sua conta docente.
					</p>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="flex items-center gap-4">
					{user.image ? (
						<img
							src={user.image}
							alt={user.name}
							className="size-16 rounded-full object-cover border border-border/60 shrink-0"
						/>
					) : (
						<div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0">
							{getInitials(user.name)}
						</div>
					)}

					<div className="space-y-1">
						<p className="text-sm font-semibold text-foreground">{user.name}</p>
						<p className="text-xs text-muted-foreground">
							Membro desde {memberSince}
						</p>
					</div>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel required leftIcon={<User className="size-3.5" />}>
										Nome Completo
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Prof. Carlos Silva"
											autoComplete="name"
											disabled={isLoading}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel leftIcon={<Mail className="size-3.5" />}>
								E-mail do Docente
							</FormLabel>
							<div className="flex items-center gap-2">
								<Input
									value={user.email}
									disabled
									containerClassName="flex-1"
								/>
								{user.emailVerified ? (
									<Badge
										variant="success-outline"
										size="sm"
										leftIcon={<BadgeCheck />}
										className="shrink-0"
									>
										Verificado
									</Badge>
								) : (
									<Badge
										variant="warning-outline"
										size="sm"
										leftIcon={<ShieldAlert />}
										className="shrink-0"
									>
										Não verificado
									</Badge>
								)}
							</div>
						</FormItem>

						<div className="flex justify-end pt-2">
							<Button
								type="submit"
								variant="default"
								isLoading={isLoading}
								disabled={!form.formState.isDirty}
								leftIcon={<Save className="size-4" />}
							>
								Salvar Alterações
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
