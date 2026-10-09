import {
	classroomsTable,
	db,
	eq,
	examsTable,
	subjectsTable,
	submissionsTable,
	subscriptionsTable,
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
import { UnauthorizedError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { cancelAsaasSubscription } from '@/lib/billing/cancel-asaas-subscription'
import { createTestApp } from '@/test/create-test-app'
import { insertBillingCustomer } from '@/test/db-factories/insert-billing-customer'
import { insertCorrectionCredit } from '@/test/db-factories/insert-correction-credit'
import { insertPlan } from '@/test/db-factories/insert-plan'
import { insertSubscription } from '@/test/db-factories/insert-subscription'
import { insertUser } from '@/test/db-factories/insert-user'
import { makeClassroom } from '@/test/factories/make-classroom'
import { makeExam } from '@/test/factories/make-exam'
import { makeSubmission } from '@/test/factories/make-submission'
import { sendBillingNotificationEmail } from './send-billing-notification-email'

vi.mock('@/lib/billing/cancel-asaas-subscription', () => ({
	cancelAsaasSubscription: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('./send-billing-notification-email', () => ({
	sendBillingNotificationEmail: vi.fn().mockResolvedValue(undefined),
}))

const DAY_MS = 1000 * 60 * 60 * 24

type User = Awaited<ReturnType<typeof insertUser>>

const EMPTY_STATUS = {
	plan: null,
	subscriptionStatus: null,
	currentPeriodEnd: null,
	cancelAtPeriodEnd: false,
	subscriberSince: null,
	correctionsUsed: 0,
	creditBalance: 0,
	hasBillingCustomer: false,
}

async function insertExamFor(creatorId: string) {
	const [subject] = await db
		.insert(subjectsTable)
		.values({ name: `Disciplina ${creatorId}` })
		.returning()
	const [classroom] = await db
		.insert(classroomsTable)
		.values(makeClassroom({ subjectId: subject.id, teacherId: creatorId }))
		.returning()
	const [exam] = await db
		.insert(examsTable)
		.values(makeExam({ classroomId: classroom.id, creatorId }))
		.returning()

	return exam
}

async function selectSubscription(id: string) {
	const [row] = await db
		.select()
		.from(subscriptionsTable)
		.where(eq(subscriptionsTable.id, id))

	return row
}

describe('GET /billing/status (integração)', () => {
	let app: FastifyInstance
	let user: User

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		user = await insertUser()
		vi.mocked(getAuthenticatedUser).mockResolvedValue(user as never)
	})

	it('retorna plano nulo, saldo zerado e hasBillingCustomer false quando o usuário não tem assinatura, crédito nem cliente no Asaas', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(EMPTY_STATUS)
	})

	it('retorna os dados do plano e o uso do ciclo quando o usuário tem assinatura ativa', async () => {
		const now = Date.now()
		const plan = await insertPlan({
			slug: 'essencial',
			name: 'Essencial',
			monthlyCorrectionsLimit: 100,
			allowsDocxExport: false,
		})
		const subscription = await insertSubscription({
			userId: user.id,
			planId: plan.id,
			status: 'active',
			currentPeriodStart: new Date(now - 10 * DAY_MS),
			currentPeriodEnd: new Date(now + 20 * DAY_MS),
			createdAt: new Date(now - 90 * DAY_MS),
		})
		const exam = await insertExamFor(user.id)
		await db.insert(submissionsTable).values([
			makeSubmission({ examId: exam.id, createdAt: new Date(now - DAY_MS) }),
			makeSubmission({
				examId: exam.id,
				createdAt: new Date(now - 2 * DAY_MS),
			}),
			makeSubmission({
				examId: exam.id,
				createdAt: new Date(now - 30 * DAY_MS),
			}),
		])
		await insertCorrectionCredit({ userId: user.id, delta: 10 })
		await insertCorrectionCredit({
			userId: user.id,
			delta: -7,
			source: 'consumption',
		})
		await insertBillingCustomer({ userId: user.id })

		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			plan: {
				slug: 'essencial',
				name: 'Essencial',
				monthlyCorrectionsLimit: 100,
				allowsDocxExport: false,
			},
			subscriptionStatus: 'active',
			currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
			cancelAtPeriodEnd: false,
			subscriberSince: subscription.createdAt.toISOString(),
			correctionsUsed: 2,
			creditBalance: 3,
			hasBillingCustomer: true,
		})
	})

	it('reconcilia para cancelado quando o período pago já terminou com cancelAtPeriodEnd (bloco 8.5)', async () => {
		const subscription = await insertSubscription({
			userId: user.id,
			status: 'active',
			currentPeriodStart: new Date(Date.now() - 40 * DAY_MS),
			currentPeriodEnd: new Date(Date.now() - 10 * DAY_MS),
			cancelAtPeriodEnd: true,
		})

		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(EMPTY_STATUS)
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'canceled',
		})
		expect(cancelAsaasSubscription).not.toHaveBeenCalled()
		expect(sendBillingNotificationEmail).toHaveBeenCalledWith({
			type: 'subscription_canceled',
			userId: user.id,
		})
	})

	it('reconcilia para cancelado quando past_due ultrapassou o prazo de tolerância (bloco 8.5)', async () => {
		const subscription = await insertSubscription({
			userId: user.id,
			asaasSubscriptionId: 'sub_asaas_2',
			status: 'past_due',
			currentPeriodStart: new Date(Date.now() - 10 * DAY_MS),
			currentPeriodEnd: new Date(Date.now() + 20 * DAY_MS),
			cancelAtPeriodEnd: false,
			updatedAt: new Date(Date.now() - 4 * DAY_MS),
		})

		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toMatchObject({
			plan: null,
			subscriptionStatus: null,
		})
		expect(cancelAsaasSubscription).toHaveBeenCalledWith('sub_asaas_2')
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'canceled',
		})
	})

	it('mantém past_due dentro do prazo de tolerância e não altera o banco', async () => {
		const subscription = await insertSubscription({
			userId: user.id,
			status: 'past_due',
			currentPeriodStart: new Date(Date.now() - 10 * DAY_MS),
			currentPeriodEnd: new Date(Date.now() + 20 * DAY_MS),
			updatedAt: new Date(Date.now() - DAY_MS),
		})

		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toMatchObject({ subscriptionStatus: 'past_due' })
		expect(cancelAsaasSubscription).not.toHaveBeenCalled()
		expect(await selectSubscription(subscription.id)).toMatchObject({
			status: 'past_due',
			updatedAt: subscription.updatedAt,
		})
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(getAuthenticatedUser).mockRejectedValue(
			new UnauthorizedError('Você precisa estar autenticado para continuar.'),
		)

		const response = await app.inject({
			method: 'GET',
			url: '/billing/status',
		})

		expect(response.statusCode).toBe(401)
	})
})
