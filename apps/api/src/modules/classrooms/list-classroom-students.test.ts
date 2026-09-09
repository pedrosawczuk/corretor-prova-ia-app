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

describe('GET /classrooms/:classroomId/students', () => {
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

	it('retorna a lista de nomes distintos de alunos ordenados pela submissão mais recente', async () => {
		const classroom = makeClassroom({ teacherId: user.id })
		const exam1 = makeExam({ classroomId: classroom.id, creatorId: user.id })
		const exam2 = makeExam({ classroomId: classroom.id, creatorId: user.id })

		const sub1 = makeSubmission({
			examId: exam1.id,
			studentIdentifier: 'Ana Silva',
		})
		const sub2 = makeSubmission({
			examId: exam1.id,
			studentIdentifier: 'Bruno Costa',
		})
		const sub3 = makeSubmission({
			examId: exam2.id,
			studentIdentifier: 'Ana Silva',
		})
		const subNull = makeSubmission({
			examId: exam2.id,
			studentIdentifier: null,
		})

		expect(sub1.studentIdentifier).toBe('Ana Silva')
		expect(sub2.studentIdentifier).toBe('Bruno Costa')
		expect(sub3.studentIdentifier).toBe('Ana Silva')
		expect(subNull.studentIdentifier).toBeNull()

		vi.mocked(db.select)
			.mockReturnValueOnce(createDbChain([classroom]) as never)
			.mockReturnValueOnce(
				createDbChain([
					{ studentIdentifier: 'Ana Silva' },
					{ studentIdentifier: 'Bruno Costa' },
				]) as never,
			)

		const response = await app.inject({
			method: 'GET',
			url: `/classrooms/${classroom.id}/students`,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual(['Ana Silva', 'Bruno Costa'])
	})

	it('retorna 404 quando a turma pertence a outro professor', async () => {
		const otherClassroom = makeClassroom()

		vi.mocked(db.select).mockReturnValueOnce(
			createDbChain([otherClassroom]) as never,
		)

		const response = await app.inject({
			method: 'GET',
			url: `/classrooms/${otherClassroom.id}/students`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 404 quando a turma não existe', async () => {
		vi.mocked(db.select).mockReturnValueOnce(createDbChain([]) as never)

		const response = await app.inject({
			method: 'GET',
			url: `/classrooms/${crypto.randomUUID()}/students`,
		})

		expect(response.statusCode).toBe(404)
	})

	it('retorna 400 quando classroomId não é um UUID válido', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/classrooms/id-invalido/students',
		})

		expect(response.statusCode).toBe(400)
		expect(db.select).not.toHaveBeenCalled()
	})

	it('retorna 401 quando o usuário não está autenticado', async () => {
		vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(
			new UnauthorizedError('Você precisa estar autenticado para continuar.'),
		)

		const response = await app.inject({
			method: 'GET',
			url: `/classrooms/${crypto.randomUUID()}/students`,
		})

		expect(response.statusCode).toBe(401)
		expect(db.select).not.toHaveBeenCalled()
	})
})
