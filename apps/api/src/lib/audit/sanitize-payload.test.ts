import { describe, expect, it } from 'vitest'
import { sanitizeHttpPath } from './sanitize-payload'

describe('sanitizeHttpPath', () => {
	it('mantém caminhos sem query string intactos', () => {
		expect(sanitizeHttpPath('/auth/verify-email')).toBe('/auth/verify-email')
	})

	it('redige parâmetros sensíveis na query string', () => {
		const sanitized = sanitizeHttpPath(
			'/auth/verify-email?token=secret-123&callbackURL=https%3A%2F%2Fapp.example.com%2Fdashboard',
		)

		expect(sanitized).toContain('/auth/verify-email?')
		expect(sanitized).not.toContain('secret-123')
		expect(sanitized).toContain('token=%5BREDACTED%5D')
		expect(sanitized).toContain('callbackURL=')
	})
})
