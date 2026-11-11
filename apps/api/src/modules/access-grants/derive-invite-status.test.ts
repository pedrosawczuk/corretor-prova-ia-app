import { describe, expect, it } from 'vitest'
import { deriveAccessGrantStatus } from './derive-access-grant-status'
import { deriveInviteStatus } from './derive-invite-status'

const now = new Date('2026-05-01T12:00:00Z')
const future = new Date('2026-05-10T12:00:00Z')
const past = new Date('2026-04-10T12:00:00Z')

describe('deriveInviteStatus', () => {
	it('prioriza aceito, depois revogado, depois expirado', () => {
		expect(
			deriveInviteStatus(
				{ expiresAt: past, acceptedAt: past, revokedAt: past },
				now,
			),
		).toBe('accepted')
		expect(
			deriveInviteStatus(
				{ expiresAt: past, acceptedAt: null, revokedAt: past },
				now,
			),
		).toBe('revoked')
		expect(
			deriveInviteStatus(
				{ expiresAt: past, acceptedAt: null, revokedAt: null },
				now,
			),
		).toBe('expired')
		expect(
			deriveInviteStatus(
				{ expiresAt: future, acceptedAt: null, revokedAt: null },
				now,
			),
		).toBe('pending')
	})
})

describe('deriveAccessGrantStatus', () => {
	it('diferencia ativa, vencida e revogada', () => {
		expect(
			deriveAccessGrantStatus({ expiresAt: future, revokedAt: null }, now),
		).toBe('active')
		expect(
			deriveAccessGrantStatus({ expiresAt: past, revokedAt: null }, now),
		).toBe('expired')
		expect(
			deriveAccessGrantStatus({ expiresAt: future, revokedAt: past }, now),
		).toBe('revoked')
	})
})
