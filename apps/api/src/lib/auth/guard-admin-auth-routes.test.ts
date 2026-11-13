import { describe, expect, it, vi } from 'vitest'

vi.unmock('@/lib/auth/get-authenticated-admin')

vi.mock('@/lib/audit/audit-log', () => ({
	recordAuditLog: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('./auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}))

import { auth } from './auth'
import {
	guardAdminAuthRoute,
	isAdminAuthRoute,
} from './guard-admin-auth-routes'

describe('isAdminAuthRoute', () => {
	it('identifica rotas /api/auth/admin/*', () => {
		expect(isAdminAuthRoute('/api/auth/admin/set-role')).toBe(true)
		expect(isAdminAuthRoute('/api/auth/admin')).toBe(true)
		expect(isAdminAuthRoute('/api/auth/sign-in/email')).toBe(false)
	})

	it('normaliza dot-segments, barras duplicadas e percent-encoding antes de checar', () => {
		expect(isAdminAuthRoute('/api/auth/./admin/set-role')).toBe(true)
		expect(isAdminAuthRoute('/api/auth/x/../admin/impersonate-user')).toBe(true)
		expect(isAdminAuthRoute('/api/auth//admin/set-role')).toBe(true)
		expect(isAdminAuthRoute('/api/auth///admin///ban-user?foo=1')).toBe(true)
		expect(isAdminAuthRoute('/api/auth/%2e/admin/set-role')).toBe(true)
		expect(isAdminAuthRoute('/api/auth/x/%2e%2e/admin/set-role')).toBe(true)
		expect(isAdminAuthRoute('/api/auth/admin/../sign-in/email')).toBe(false)
	})
})

describe('guardAdminAuthRoute', () => {
	const createReply = () => {
		const send = vi.fn()
		const status = vi.fn().mockReturnValue({ send })
		return { status, send }
	}

	const createRequest = (url = '/api/auth/admin/set-role') =>
		({
			id: 'req-1',
			method: 'POST',
			url,
			headers: {},
			ip: '127.0.0.1',
		}) as never

	it('bloqueia com 403 sessão admin recente sem verificação explícita de 2FA (OAuth / trust_device)', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce({
			user: {
				id: 'admin-1',
				email: 'admin@example.com',
				role: 'admin',
				twoFactorEnabled: true,
			},
			session: {
				id: 'sess-1',
				createdAt: new Date(),
				twoFactorVerifiedAt: null,
			},
		} as never)

		const reply = createReply()
		const allowed = await guardAdminAuthRoute(createRequest(), reply as never)

		expect(allowed).toBe(false)
		expect(reply.status).toHaveBeenCalledWith(403)
		expect(reply.send).toHaveBeenCalledWith(
			expect.objectContaining({ code: 'ADMIN_TWO_FACTOR_REQUIRED' }),
		)
	})

	it('permite sessão admin com verificação explícita de 2FA recente', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce({
			user: {
				id: 'admin-1',
				email: 'admin@example.com',
				role: 'admin',
				twoFactorEnabled: true,
			},
			session: {
				id: 'sess-1',
				createdAt: new Date(),
				twoFactorVerifiedAt: new Date(),
			},
		} as never)

		const reply = createReply()
		const allowed = await guardAdminAuthRoute(createRequest(), reply as never)

		expect(allowed).toBe(true)
		expect(reply.status).not.toHaveBeenCalled()
	})
})
