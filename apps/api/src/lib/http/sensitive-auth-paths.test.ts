import { describe, expect, it } from 'vitest'
import { isSensitiveAuthPath } from './sensitive-auth-paths'

describe('isSensitiveAuthPath', () => {
	it('identifica caminhos sensíveis normais', () => {
		expect(isSensitiveAuthPath('/api/auth/sign-in/email')).toBe(true)
		expect(isSensitiveAuthPath('/api/auth/two-factor/verify-totp')).toBe(true)
		expect(isSensitiveAuthPath('/api/auth/get-session')).toBe(false)
	})

	it('identifica caminhos sensíveis com dot-segments e barras duplicadas', () => {
		expect(isSensitiveAuthPath('/api/auth/./sign-in/email')).toBe(true)
		expect(isSensitiveAuthPath('/api/auth/x/../two-factor/verify-totp')).toBe(
			true,
		)
		expect(isSensitiveAuthPath('/api/auth//reset-password')).toBe(true)
		expect(isSensitiveAuthPath('/api/auth/%2e/delete-user')).toBe(true)
	})
})
