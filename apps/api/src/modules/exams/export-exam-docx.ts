import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { getOrSetCache } from '@/lib/cache/redis'
import { buildExamDocx } from './build-exam-docx'
import { EXAM_CACHE_TTL_SECONDS, examCacheKey } from './exam-cache'
import { buildExamExportFilename } from './exam-export-data'
import type { ExamParams } from './exam-params-schema'
import { fetchExamDetail } from './fetch-exam-detail'
import { fetchExamHeaderInfo } from './fetch-exam-header-info'

export async function exportExamDocxModule(
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

	const headerInfo = await fetchExamHeaderInfo(exam.classroomId, exam.creatorId)
	const buffer = await buildExamDocx({ ...exam, ...headerInfo })
	const filename = buildExamExportFilename(exam.title, 'docx')

	return reply
		.header(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		)
		.header(
			'Content-Disposition',
			`attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
		)
		.send(buffer)
}
