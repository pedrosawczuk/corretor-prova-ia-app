import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { getOrSetCache } from '@/lib/cache/redis'
import { EXAM_CACHE_TTL_SECONDS, examCacheKey } from './exam-cache'
import type { ExamParams } from './exam-params-schema'
import { fetchExamDetail } from './fetch-exam-detail'

export async function getExamModule(
	request: FastifyRequest<{ Params: ExamParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { examId } = request.params

	const exam = await getOrSetCache(
		examCacheKey(examId),
		EXAM_CACHE_TTL_SECONDS,
		() => fetchExamDetail(examId),
	)

	if (!exam || exam.creatorId !== user.id) {
		throw new NotFoundError('Prova não encontrada.')
	}

	return reply.status(200).send(exam)
}
