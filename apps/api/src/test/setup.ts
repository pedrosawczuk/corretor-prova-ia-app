import { beforeEach, vi } from 'vitest'
import {
	sendNewLoginEmail,
	sendPasswordResetEmail,
	sendWelcomeEmail,
} from '@/lib/mail'

vi.mock('@app/db', () => ({
	classroomsTable: {},
	examsTable: {},
	questionsTable: {},
	questionOptionsTable: {},
	db: {
		delete: vi.fn(),
		insert: vi.fn(),
		select: vi.fn(),
		transaction: vi.fn(),
		update: vi.fn(),
	},
	desc: vi.fn(),
	eq: vi.fn(),
	inArray: vi.fn(),
}))

vi.mock('@/lib/get-authenticated-user', () => ({
	getAuthenticatedUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
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

vi.mock('@/lib/mail', () => ({
	sendNewLoginEmail: vi.fn().mockResolvedValue(undefined),
	sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
	sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}))

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(sendWelcomeEmail).mockResolvedValue(undefined)
	vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined)
	vi.mocked(sendNewLoginEmail).mockResolvedValue(undefined)
})
