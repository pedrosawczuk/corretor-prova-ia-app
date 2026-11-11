import type { InviteLookup } from '@/hooks/use-invite-lookup'

type UnavailableInviteStatus = Exclude<InviteLookup['status'], 'pending'>

export const UNAVAILABLE_INVITE_COPY: Record<
	UnavailableInviteStatus,
	{ title: string; description: string }
> = {
	accepted: {
		title: 'Este convite já foi usado',
		description:
			'A cortesia deste convite já está ativa. Entre com o e-mail convidado para acessar sua conta.',
	},
	expired: {
		title: 'Este convite expirou',
		description:
			'O prazo para aceitar este convite acabou. Peça um novo convite para quem te convidou.',
	},
	revoked: {
		title: 'Este convite foi cancelado',
		description:
			'Este link não é mais válido. Se você acha que isso é um engano, fale com quem te convidou.',
	},
	not_found: {
		title: 'Convite não encontrado',
		description:
			'Não encontramos este convite. Confira se o link foi copiado por completo.',
	},
}

export function buildInviteAuthHref(
	invite: Extract<InviteLookup, { status: 'pending' }>,
) {
	const email = encodeURIComponent(invite.email)

	return invite.hasAccount
		? `/entrar?email=${email}`
		: `/criar-conta?email=${email}`
}

export function resolveUnavailableInviteStatus(
	invite: InviteLookup | undefined,
): UnavailableInviteStatus {
	return invite && invite.status !== 'pending' ? invite.status : 'not_found'
}
