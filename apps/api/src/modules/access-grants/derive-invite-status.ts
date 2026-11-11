interface InviteStatusSource {
	expiresAt: Date
	acceptedAt: Date | null
	revokedAt: Date | null
}

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export function deriveInviteStatus(
	invite: InviteStatusSource,
	now: Date = new Date(),
): InviteStatus {
	if (invite.acceptedAt) return 'accepted'
	if (invite.revokedAt) return 'revoked'
	if (invite.expiresAt <= now) return 'expired'
	return 'pending'
}
