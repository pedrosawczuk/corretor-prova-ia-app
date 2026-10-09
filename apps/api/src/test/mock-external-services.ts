import { vi } from 'vitest'

vi.mock('@/lib/auth/get-authenticated-user', () => ({
	getAuthenticatedUser: vi.fn(),
}))

vi.mock('@/lib/auth/get-authenticated-admin', () => ({
	getAuthenticatedAdmin: vi.fn(),
}))

vi.mock('@/lib/auth/auth', () => ({
	auth: {
		api: {
			changePassword: vi.fn(),
			disableTwoFactor: vi.fn(),
			enableTwoFactor: vi.fn(),
			requestPasswordReset: vi.fn(),
			resetPassword: vi.fn(),
			revokeOtherSessions: vi.fn(),
			revokeSession: vi.fn(),
			sendTwoFactorOTP: vi.fn(),
			sendVerificationEmail: vi.fn(),
			signInEmail: vi.fn(),
			signInSocial: vi.fn(),
			signOut: vi.fn(),
			signUpEmail: vi.fn(),
			updateUser: vi.fn(),
			verifyEmail: vi.fn(),
			verifyTOTP: vi.fn(),
			verifyTwoFactorOTP: vi.fn(),
		},
	},
}))

vi.mock('@/lib/mail/mail', () => ({
	sendNewLoginEmail: vi.fn().mockResolvedValue(undefined),
	sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
	sendPaymentFailedEmail: vi.fn().mockResolvedValue(undefined),
	sendSubscriptionCancelledEmail: vi.fn().mockResolvedValue(undefined),
	sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/cache/redis', () => ({
	redis: { get: vi.fn(), set: vi.fn(), del: vi.fn(), on: vi.fn() },
	getOrSetCache: vi.fn((_key: string, _ttl: number, fetcher: () => unknown) =>
		fetcher(),
	),
	invalidateCache: vi.fn().mockResolvedValue(undefined),
}))
