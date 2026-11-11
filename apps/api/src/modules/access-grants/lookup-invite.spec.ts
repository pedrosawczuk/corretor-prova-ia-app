import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestApp } from '@/test/create-test-app'
import { insertInvite } from '@/test/db-factories/insert-invite'
import { insertUser } from '@/test/db-factories/insert-user'
import { generateInviteToken, hashInviteToken } from './invite-token'

const DAY_MS = 1000 * 60 * 60 * 24

describe('POST /invites/lookup (integração)', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	async function lookup(token: string) {
		return app.inject({
			method: 'POST',
			url: '/invites/lookup',
			payload: { token },
		})
	}

	it('retorna os dados do convite pendente e se o e-mail já tem conta', async () => {
		const token = generateInviteToken()
		const invite = await insertInvite({
			email: 'prof@escola.com',
			tokenHash: hashInviteToken(token),
		})
		await insertUser({ email: 'prof@escola.com' })

		const response = await lookup(token)

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			status: 'pending',
			email: 'prof@escola.com',
			hasAccount: true,
			grantDurationMonths: 3,
			expiresAt: invite.expiresAt.toISOString(),
		})
	})

	it('não expõe o e-mail de convite expirado', async () => {
		const token = generateInviteToken()
		await insertInvite({
			tokenHash: hashInviteToken(token),
			expiresAt: new Date(Date.now() - DAY_MS),
		})

		const response = await lookup(token)

		expect(response.json()).toEqual({ status: 'expired' })
	})

	it('retorna not_found para token desconhecido', async () => {
		const response = await lookup(generateInviteToken())

		expect(response.json()).toEqual({ status: 'not_found' })
	})

	it('retorna 400 para token malformado', async () => {
		const response = await lookup('curto')

		expect(response.statusCode).toBe(400)
	})
})
