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
import {
	BadgeCheck,
	Camera,
	Loader2,
	Mail,
	Save,
	ShieldAlert,
	User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { applyApiErrorsToForm, toastApiError } from '@/lib/api-error-handler'
import type { AuthUser } from '@/lib/auth-server'
import { formatDate } from '@/lib/date'

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/)
	const first = parts[0]?.[0] ?? ''
	const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
	return (first + last).toUpperCase() || 'U'
}

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

export function PerfilSection({ user }: { user: AuthUser }) {
	const router = useRouter()
	const [isLoading, setIsLoading] = React.useState(false)
	const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
	const avatarInputRef = React.useRef<HTMLInputElement>(null)

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

	async function onAvatarSelected(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0]
		event.target.value = ''
		if (!file) return

		if (!file.type.startsWith('image/')) {
			toast.error('O arquivo enviado precisa ser uma imagem.')
			return
		}

		if (file.size > MAX_AVATAR_SIZE_BYTES) {
			toast.error('A imagem deve ter no máximo 5MB.')
			return
		}

		setIsUploadingAvatar(true)

		try {
			const formData = new FormData()
			formData.append('file', file)

			await apiClient('/auth/upload-avatar', {
				method: 'POST',
				body: formData,
			})

			toast.success('Foto de perfil atualizada com sucesso!')
			router.refresh()
		} catch (error) {
			toastApiError(
				error,
				'Não foi possível atualizar sua foto. Tente novamente.',
			)
		} finally {
			setIsUploadingAvatar(false)
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
					<button
						type="button"
						onClick={() => avatarInputRef.current?.click()}
						disabled={isUploadingAvatar}
						className="relative size-16 rounded-full shrink-0 group cursor-pointer disabled:cursor-not-allowed"
						aria-label="Alterar foto de perfil"
					>
						{user.image ? (
							<img
								src={user.image}
								alt={user.name}
								className="size-16 rounded-full object-cover border border-border/60"
							/>
						) : (
							<div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
								{getInitials(user.name)}
							</div>
						)}

						<div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							{isUploadingAvatar ? (
								<Loader2 className="size-5 text-white animate-spin" />
							) : (
								<Camera className="size-5 text-white" />
							)}
						</div>

						<input
							ref={avatarInputRef}
							type="file"
							accept="image/*"
							onChange={onAvatarSelected}
							disabled={isUploadingAvatar}
							className="sr-only"
						/>
					</button>

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
