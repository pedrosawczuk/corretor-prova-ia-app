import {
	accessGrantsTable,
	db,
	eq,
	invitesTable,
	privilegedEmailsTable,
} from '@app/db'
import type { FastifyInstance } from 'fastify'
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { ForbiddenError } from '@/core/errors'
import { getAuthenticatedAdmin } from '@/lib/auth/get-authenticated-admin'
import { sendInviteEmail } from '@/lib/mail/mail'
import { createTestApp } from '@/test/create-test-app'
import { insertAccessGrant } from '@/test/db-factories/insert-access-grant'
import { insertInvite } from '@/test/db-factories/insert-invite'
import { insertPrivilegedEmail } from '@/test/db-factories/insert-privileged-email'
import { insertUser } from '@/test/db-factories/insert-user'
import { hashInviteToken } from './invite-token'

const DAY_MS = 1000 * 60 * 60 * 24

async function selectInvitesByEmail(email: string) {
	return db.select().from(invitesTable).where(eq(invitesTable.email, email))
}

function extractTokenFromLastInviteEmail() {
	const { inviteUrl } = vi.mocked(sendInviteEmail).mock.calls.at(-1)?.[0] ?? {
		inviteUrl: '',
	}
	return inviteUrl.split('/convite/')[1]
}

describe('rotas de admin de convites e cortesias (integração)', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		const admin = await insertUser({ role: 'admin' })
		vi.mocked(getAuthenticatedAdmin).mockResolvedValue(admin as never)
	})

	describe('POST /admin/invites', () => {
		it('cria o convite, guarda só o hash do token e envia o e-mail com o link', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/admin/invites',
				payload: { email: '  Prof@Escola.com ' },
			})

			expect(response.statusCode).toBe(201)
			expect(response.json()).toMatchObject({
				email: 'prof@escola.com',
				status: 'pending',
			})
			const token = extractTokenFromLastInviteEmail()
			const [invite] = await selectInvitesByEmail('prof@escola.com')
			expect(token).toBeTruthy()
			expect(invite.tokenHash).toBe(hashInviteToken(token))
			expect(invite.tokenHash).not.toBe(token)
			expect(sendInviteEmail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'prof@escola.com',
					grantDurationMonths: 3,
					inviteExpiresInDays: 14,
				}),
			)
		})

		it('retorna 409 quando já existe convite pendente para o e-mail', async () => {
			await insertInvite({ email: 'prof@escola.com' })

			const response = await app.inject({
				method: 'POST',
				url: '/admin/invites',
				payload: { email: 'prof@escola.com' },
			})

			expect(response.statusCode).toBe(409)
		})

		it('reaproveita um convite expirado gerando token e validade novos', async () => {
			const expired = await insertInvite({
				email: 'prof@escola.com',
				expiresAt: new Date(Date.now() - DAY_MS),
			})

			const response = await app.inject({
				method: 'POST',
				url: '/admin/invites',
				payload: { email: 'prof@escola.com' },
			})

			expect(response.statusCode).toBe(201)
			const invites = await selectInvitesByEmail('prof@escola.com')
			expect(invites).toHaveLength(1)
			expect(invites[0].id).toBe(expired.id)
			expect(invites[0].tokenHash).not.toBe(expired.tokenHash)
			expect(invites[0].expiresAt.getTime()).toBeGreaterThan(Date.now())
		})

		it('retorna 409 quando o e-mail já recebeu cortesia', async () => {
			const user = await insertUser({ email: 'prof@escola.com' })
			await insertAccessGrant({ userId: user.id })

			const response = await app.inject({
				method: 'POST',
				url: '/admin/invites',
				payload: { email: 'prof@escola.com' },
			})

			expect(response.statusCode).toBe(409)
			expect(sendInviteEmail).not.toHaveBeenCalled()
		})

		it('retorna 400 para e-mail inválido', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/admin/invites',
				payload: { email: 'não-é-email' },
			})

			expect(response.statusCode).toBe(400)
		})

		it('retorna 403 para quem não é admin', async () => {
			vi.mocked(getAuthenticatedAdmin).mockRejectedValue(
				new ForbiddenError('Acesso restrito a administradores.'),
			)

			const response = await app.inject({
				method: 'POST',
				url: '/admin/invites',
				payload: { email: 'prof@escola.com' },
			})

			expect(response.statusCode).toBe(403)
		})
	})

	describe('reenviar, revogar e listar convites', () => {
		it('reenvia trocando o token e renovando a validade', async () => {
			const invite = await insertInvite({
				email: 'prof@escola.com',
				expiresAt: new Date(Date.now() - DAY_MS),
			})

			const response = await app.inject({
				method: 'POST',
				url: `/admin/invites/${invite.id}/resend`,
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toMatchObject({ status: 'pending' })
			const [updated] = await selectInvitesByEmail('prof@escola.com')
			expect(updated.tokenHash).toBe(
				hashInviteToken(extractTokenFromLastInviteEmail()),
			)
		})

		it('não reenvia convite já aceito', async () => {
			const invite = await insertInvite({ acceptedAt: new Date() })

			const response = await app.inject({
				method: 'POST',
				url: `/admin/invites/${invite.id}/resend`,
			})

			expect(response.statusCode).toBe(409)
		})

		it('revoga um convite pendente', async () => {
			const invite = await insertInvite({ email: 'prof@escola.com' })

			const response = await app.inject({
				method: 'DELETE',
				url: `/admin/invites/${invite.id}`,
			})

			expect(response.statusCode).toBe(204)
			const [updated] = await selectInvitesByEmail('prof@escola.com')
			expect(updated.revokedAt).not.toBeNull()
		})

		it('lista os convites com status derivado', async () => {
			await insertInvite({ email: 'pendente@escola.com' })
			await insertInvite({
				email: 'expirado@escola.com',
				expiresAt: new Date(Date.now() - DAY_MS),
			})
			await insertInvite({
				email: 'aceito@escola.com',
				acceptedAt: new Date(),
			})

			const response = await app.inject({
				method: 'GET',
				url: '/admin/invites',
			})

			expect(response.statusCode).toBe(200)
			const statusByEmail = Object.fromEntries(
				response
					.json()
					.data.map((invite: { email: string; status: string }) => [
						invite.email,
						invite.status,
					]),
			)
			expect(statusByEmail).toEqual({
				'pendente@escola.com': 'pending',
				'expirado@escola.com': 'expired',
				'aceito@escola.com': 'accepted',
			})
		})
	})

	describe('e-mails privilegiados', () => {
		it('adiciona, impede duplicado e remove', async () => {
			const created = await app.inject({
				method: 'POST',
				url: '/admin/privileged-emails',
				payload: { email: 'Parceiro@Escola.com', note: 'Beta tester' },
			})
			const duplicated = await app.inject({
				method: 'POST',
				url: '/admin/privileged-emails',
				payload: { email: 'parceiro@escola.com' },
			})

			expect(created.statusCode).toBe(201)
			expect(created.json()).toMatchObject({
				email: 'parceiro@escola.com',
				note: 'Beta tester',
				claimedAt: null,
			})
			expect(duplicated.statusCode).toBe(409)

			const deleted = await app.inject({
				method: 'DELETE',
				url: `/admin/privileged-emails/${created.json().id}`,
			})

			expect(deleted.statusCode).toBe(204)
			expect(await db.select().from(privilegedEmailsTable)).toHaveLength(0)
		})

		it('lista indicando quem já usou a cortesia', async () => {
			const user = await insertUser({ email: 'usou@escola.com' })
			const grant = await insertAccessGrant({
				userId: user.id,
				source: 'privileged_email',
			})
			await insertPrivilegedEmail({ email: 'usou@escola.com' })
			await insertPrivilegedEmail({ email: 'nao-usou@escola.com' })

			const response = await app.inject({
				method: 'GET',
				url: '/admin/privileged-emails',
			})

			const claimedByEmail = Object.fromEntries(
				response
					.json()
					.data.map((row: { email: string; claimedAt: string | null }) => [
						row.email,
						row.claimedAt,
					]),
			)
			expect(claimedByEmail).toEqual({
				'usou@escola.com': grant.startsAt.toISOString(),
				'nao-usou@escola.com': null,
			})
		})
	})

	describe('cortesias', () => {
		it('lista e revoga uma cortesia', async () => {
			const user = await insertUser({ name: 'Ana', email: 'ana@escola.com' })
			const grant = await insertAccessGrant({ userId: user.id })

			const listResponse = await app.inject({
				method: 'GET',
				url: '/admin/access-grants',
			})

			expect(listResponse.json().data).toEqual([
				expect.objectContaining({
					id: grant.id,
					userName: 'Ana',
					userEmail: 'ana@escola.com',
					planName: 'Pro',
					status: 'active',
				}),
			])

			const revokeResponse = await app.inject({
				method: 'POST',
				url: `/admin/access-grants/${grant.id}/revoke`,
			})

			expect(revokeResponse.statusCode).toBe(204)
			const [revoked] = await db
				.select()
				.from(accessGrantsTable)
				.where(eq(accessGrantsTable.id, grant.id))
			expect(revoked.revokedAt).not.toBeNull()
		})

		it('retorna 404 ao revogar cortesia inexistente', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/admin/access-grants/2b8f2a52-4c1b-4d0f-9a64-1f1f8b0c1a11/revoke',
			})

			expect(response.statusCode).toBe(404)
		})
	})
})
