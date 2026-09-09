import { db } from '@app/db'
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
import { createDbChain } from '@/test/create-db-chain'
import { createTestApp } from '@/test/create-test-app'
import { makeAuthenticatedUser } from '@/test/factories/make-authenticated-user'
import { makeClassroom } from '@/test/factories/make-classroom'
import { makeExam } from '@/test/factories/make-exam'
import { makeSubmission } from '@/test/factories/make-submission'
import { makeSubmissionAnswer } from '@/test/factories/make-submission-answer'

describe('GET /dashboard/performance-overview', () => {
	let app: FastifyInstance
	const user = makeAuthenticatedUser()

	beforeAll(async () => {
		app = createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		vi.mocked(getAuthenticatedUser).mockResolvedValue(user as never)
	})

	it('retorna 200 com métricas gerais (incluindo accuracyRate) e por turma para submissões completed', async () => {
		const classroom1 = makeClassroom({ teacherId: user.id, name: 'Turma 9A' })
		const classroom2 = makeClassroom({ teacherId: user.id, name: 'Turma 9B' })

		const exam1 = makeExam({
			classroomId: classroom1.id,
			creatorId: user.id,
			totalPoints: '10.00',
		})
		const exam2 = makeExam({
			classroomId: classroom2.id,
			creatorId: user.id,
			totalPoints: '10.00',
		})

		const completedSub1 = makeSubmission({
			examId: exam1.id,
			status: 'completed',
			totalScore: '8.00',
		})
		const completedSub2 = makeSubmission({
			examId: exam2.id,
			status: 'completed',
			totalScore: '6.00',
		})
		const needsReviewSub = makeSubmission({
			examId: exam1.id,
			status: 'needs_review',
			totalScore: null,
		})

		makeSubmissionAnswer({ submissionId: completedSub1.id })
		makeSubmissionAnswer({ submissionId: completedSub2.id })
		makeSubmissionAnswer({ submissionId: needsReviewSub.id })

		const overallRow = {
			averageScorePercentage: 70.0,
			correctedSubmissionsCount: 2,
		}

		const classroomRows = [
			{
				classroomId: classroom1.id,
				classroomName: classroom1.name,
				averageScorePercentage: 80.0,
				correctedSubmissionsCount: 1,
			},
			{
				classroomId: classroom2.id,
				classroomName: classroom2.name,
				averageScorePercentage: 60.0,
				correctedSubmissionsCount: 1,
			},
		]

		const accuracyRow = {
			totalAnswers: 4,
			accuracyRate: 75.0,
		}

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([overallRow]) as never)
			.mockReturnValueOnce(createDbChain(classroomRows) as never)
			.mockReturnValueOnce(createDbChain([accuracyRow]) as never)

		const response = await app.inject({
			method: 'GET',
			url: '/dashboard/performance-overview',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			overall: {
				averageScorePercentage: 70.0,
				accuracyRate: 75.0,
				correctedSubmissionsCount: 2,
			},
			byClassroom: [
				{
					classroomId: classroom1.id,
					classroomName: 'Turma 9A',
					averageScorePercentage: 80.0,
					correctedSubmissionsCount: 1,
				},
				{
					classroomId: classroom2.id,
					classroomName: 'Turma 9B',
					averageScorePercentage: 60.0,
					correctedSubmissionsCount: 1,
				},
			],
		})
	})

	it('retorna averageScorePercentage: null, accuracyRate: null, correctedSubmissionsCount: 0 e byClassroom: [] quando não há submissões completed', async () => {
		const classroom = makeClassroom({ teacherId: user.id })
		const exam = makeExam({ classroomId: classroom.id, creatorId: user.id })
		makeSubmission({ examId: exam.id, status: 'needs_review' })

		vi.mocked(db.select)
			.mockReturnValueOnce(
				createDbChain([
					{
						averageScorePercentage: null,
						correctedSubmissionsCount: 0,
					},
				]) as never,
			)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(
				createDbChain([
					{
						totalAnswers: 0,
						accuracyRate: null,
					},
				]) as never,
			)

		const response = await app.inject({
			method: 'GET',
			url: '/dashboard/performance-overview',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			overall: {
				averageScorePercentage: null,
				accuracyRate: null,
				correctedSubmissionsCount: 0,
			},
			byClassroom: [],
		})
	})

	it('não inclui submissões de outro professor', async () => {
		const otherTeacherUser = makeAuthenticatedUser()
		const otherClassroom = makeClassroom({ teacherId: otherTeacherUser.id })
		const otherExam = makeExam({
			classroomId: otherClassroom.id,
			creatorId: otherTeacherUser.id,
		})
		makeSubmission({
			examId: otherExam.id,
			status: 'completed',
			totalScore: '10.00',
		})

		vi.mocked(db.select)
			.mockReturnValueOnce(
				createDbChain([
					{
						averageScorePercentage: null,
						correctedSubmissionsCount: 0,
					},
				]) as never,
			)
			.mockReturnValueOnce(createDbChain([]) as never)
			.mockReturnValueOnce(
				createDbChain([
					{
						totalAnswers: 0,
						accuracyRate: null,
					},
				]) as never,
			)

		const response = await app.inject({
			method: 'GET',
			url: '/dashboard/performance-overview',
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({
			overall: {
				averageScorePercentage: null,
				accuracyRate: null,
				correctedSubmissionsCount: 0,
			},
			byClassroom: [],
		})
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(
			new UnauthorizedError('Você precisa estar autenticado para continuar.'),
		)

		const response = await app.inject({
			method: 'GET',
			url: '/dashboard/performance-overview',
		})

		expect(response.statusCode).toBe(401)
		expect(db.select).not.toHaveBeenCalled()
	})
})
