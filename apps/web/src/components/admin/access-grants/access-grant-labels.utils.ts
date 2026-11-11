import type {
	AccessGrantSource,
	AccessGrantStatus,
	InviteStatus,
} from '@/hooks/use-admin-access-grants'

type BadgeVariant =
	| 'success-outline'
	| 'warning-outline'
	| 'info-outline'
	| 'destructive-outline'
	| 'subtle'

export const INVITE_STATUS_BADGE: Record<
	InviteStatus,
	{ label: string; variant: BadgeVariant }
> = {
	pending: { label: 'Pendente', variant: 'info-outline' },
	accepted: { label: 'Aceito', variant: 'success-outline' },
	expired: { label: 'Expirado', variant: 'warning-outline' },
	revoked: { label: 'Revogado', variant: 'subtle' },
}

export const ACCESS_GRANT_STATUS_BADGE: Record<
	AccessGrantStatus,
	{ label: string; variant: BadgeVariant }
> = {
	active: { label: 'Ativa', variant: 'success-outline' },
	expired: { label: 'Vencida', variant: 'subtle' },
	revoked: { label: 'Revogada', variant: 'destructive-outline' },
}

export const ACCESS_GRANT_SOURCE_LABEL: Record<AccessGrantSource, string> = {
	invite: 'Convite',
	privileged_email: 'E-mail privilegiado',
}
