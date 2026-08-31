import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { getOrSetCache, invalidateCache } from '@/lib/cache/redis'
import { buildExamPdf } from './build-exam-pdf'
import { EXAM_CACHE_TTL_SECONDS, examCacheKey } from './exam-cache'
import { buildExamExportFilename } from './exam-export-data'
import type { ExamParams } from './exam-params-schema'
import { fetchExamDetail } from './fetch-exam-detail'
import { fetchExamHeaderInfo } from './fetch-exam-header-info'
import { isExamTemplateLocked, lockExamTemplate } from './lock-exam-template'

export async function exportExamPdfModule(
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
	const examData = { ...exam, ...headerInfo }

	// Trava (ou destrava, se a prova mudou desde a última impressão) as
	// coordenadas de cada alternativa usadas depois na correção por foto.
	const buffer = isExamTemplateLocked(exam)
		? await buildExamPdf(examData)
		: await lockExamTemplate(examData).then(({ pdfBuffer }) => {
				invalidateCache(examCacheKey(examId))
				return pdfBuffer
			})

	const filename = buildExamExportFilename(exam.title, 'pdf')

	return reply
		.header('Content-Type', 'application/pdf')
		.header(
			'Content-Disposition',
			`attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
		)
		.send(buffer)
}
