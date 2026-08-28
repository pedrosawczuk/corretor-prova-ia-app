import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import type { ExamParams } from './exam-params-schema'
import { fetchExamDetail } from './fetch-exam-detail'

export async function getExamModule(
	request: FastifyRequest<{ Params: ExamParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId } = request.params

	const exam = await fetchExamDetail(examId)

	if (!exam || exam.creatorId !== user.id) {
		throw new NotFoundError('Prova não encontrada.')
	}

	return reply.status(200).send(exam)
}
