interface AccessGrantStatusSource {
	expiresAt: Date
	revokedAt: Date | null
}

export type AccessGrantStatus = 'active' | 'expired' | 'revoked'

export function deriveAccessGrantStatus(
	grant: AccessGrantStatusSource,
	now: Date = new Date(),
): AccessGrantStatus {
	if (grant.revokedAt) return 'revoked'
	if (grant.expiresAt <= now) return 'expired'
	return 'active'
}
