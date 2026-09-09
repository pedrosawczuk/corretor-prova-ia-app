import { env } from '@app/env'
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto'
import { describe, expect, it, vi } from 'vitest'

vi.unmock('@/lib/auth/auth')

describe('duração da sessão (better-auth session.expiresIn)', () => {
	it('configura a sessão para durar 30 dias', async () => {
		const { auth } = await import('./auth')

		expect(auth.options.session?.expiresIn).toBe(60 * 60 * 24 * 30)
	})
})

describe('criptografia de tokens OAuth (better-auth account.encryptOAuthTokens)', () => {
	it('criptografa um token com o secret do projeto de forma que o texto cifrado não seja o valor em claro', async () => {
		const plainAccessToken = 'ya29.a0AfH6SMB_fake_google_access_token'

		const encrypted = await symmetricEncrypt({
			key: env.BETTER_AUTH_SECRET,
			data: plainAccessToken,
		})

		expect(encrypted).not.toBe(plainAccessToken)
		expect(encrypted).not.toContain(plainAccessToken)
	})

	it('descriptografa de volta para o valor original usando o mesmo secret', async () => {
		const plainRefreshToken = '1//0g_fake_google_refresh_token'

		const encrypted = await symmetricEncrypt({
			key: env.BETTER_AUTH_SECRET,
			data: plainRefreshToken,
		})
		const decrypted = await symmetricDecrypt({
			key: env.BETTER_AUTH_SECRET,
			data: encrypted,
		})

		expect(decrypted).toBe(plainRefreshToken)
	})
})
