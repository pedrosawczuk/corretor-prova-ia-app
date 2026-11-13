import { describe, expect, it, vi } from 'vitest'

vi.unmock('@/lib/auth/get-authenticated-admin')

vi.mock('./auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}))

vi.mock('./get-authenticated-user', () => ({
	getAuthenticatedUser: vi.fn(),
}))

import { isTwoFactorVerifiedForAdmin } from './get-authenticated-admin'

describe('isTwoFactorVerifiedForAdmin', () => {
	it('rejeita quando twoFactorVerifiedAt está ausente', () => {
		expect(isTwoFactorVerifiedForAdmin(null)).toBe(false)
		expect(isTwoFactorVerifiedForAdmin(undefined)).toBe(false)
	})

	it('rejeita quando twoFactorVerifiedAt expirou (> 30 minutos)', () => {
		const expired = new Date(Date.now() - 31 * 60_000)
		expect(isTwoFactorVerifiedForAdmin(expired)).toBe(false)
	})

	it('aceita quando twoFactorVerifiedAt está dentro da janela de 30 minutos', () => {
		const recent = new Date(Date.now() - 5 * 60_000)
		expect(isTwoFactorVerifiedForAdmin(recent)).toBe(true)
	})
})
