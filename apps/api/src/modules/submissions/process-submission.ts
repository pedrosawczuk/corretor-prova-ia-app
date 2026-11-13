import {
	and,
	db,
	eq,
	inArray,
	submissionAnswersTable,
	submissionPagesTable,
	submissionsTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { BadRequestError, ConflictError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import {
	downloadSubmissionPage,
	getSubmissionPageSignedUrl,
} from '@/lib/storage/storage'
import { extractMarkersFound } from '@/lib/vision/read-submission-answers'
import { fetchQuestionsWithOptions } from '@/modules/exams/fetch-exam-detail'
import { computeSubmissionTotals } from './compute-submission-totals'
import { extractSubmissionAnswers } from './extract-submission-answers'
import { fetchOwnedSubmission } from './fetch-owned-submission'
import { gradeSubmissionAnswers } from './grade-submission-answers'
import type { SubmissionParams } from './submission-params-schema'

export async function processSubmissionModule(
	request: FastifyRequest<{ Params: SubmissionParams }>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { submissionId } = request.params

	const { submission, exam } = await fetchOwnedSubmission(submissionId, user.id)

	if (submission.status === 'processing') {
		throw new ConflictError('Esta submissão já está sendo processada.')
	}

	if (
		submission.status !== 'pending_processing' &&
		submission.status !== 'failed'
	) {
		throw new ConflictError(
			'Esta submissão já foi corrigida e não pode ser reprocessada.',
		)
	}

	if (!exam.templatePageCount) {
		throw new BadRequestError(
			'Exporte a prova em PDF antes de corrigir por foto — é isso que trava onde cada alternativa fica impressa.',
		)
	}

	const pages = await db
		.select()
		.from(submissionPagesTable)
		.where(eq(submissionPagesTable.submissionId, submissionId))
		.orderBy(submissionPagesTable.pageNumber)

	if (pages.length === 0) {
		throw new BadRequestError(
			'Envie ao menos uma foto da folha de respostas antes de processar.',
		)
	}

	if (pages.length > exam.templatePageCount) {
		throw new BadRequestError(
			`A submissão possui ${pages.length} página(s), acima do máximo de ${exam.templatePageCount} página(s) da prova.`,
		)
	}

	const uploadedPageNumbers = new Set(pages.map((page) => page.pageNumber))
	const missingPages = Array.from(
		{ length: exam.templatePageCount },
		(_, index) => index + 1,
	).filter((pageNumber) => !uploadedPageNumbers.has(pageNumber))

	if (missingPages.length > 0) {
		throw new BadRequestError(
			`Faltam fotos de ${missingPages.length} página(s) da prova (${missingPages.join(', ')}) antes de corrigir.`,
		)
	}

	const questions = await fetchQuestionsWithOptions(exam.id)

	if (questions.length === 0) {
		throw new BadRequestError('Esta prova ainda não possui questões.')
	}

	const [updated] = await db
		.update(submissionsTable)
		.set({ status: 'processing' })
		.where(
			and(
				eq(submissionsTable.id, submissionId),
				inArray(submissionsTable.status, ['pending_processing', 'failed']),
			),
		)
		.returning({ id: submissionsTable.id })

	if (!updated) {
		throw new ConflictError('Esta submissão já está sendo processada.')
	}

	try {
		const pageImages = await Promise.all(
			pages.map(async (page) => ({
				pageNumber: page.pageNumber,
				data: await downloadSubmissionPage(page.imageUrl),
			})),
		)

		const { answers: extracted, pageDiagnostics } =
			await extractSubmissionAnswers(pageImages, questions)

		const graded = gradeSubmissionAnswers(questions, extracted)

		await db.transaction(async (tx) => {
			await tx
				.delete(submissionAnswersTable)
				.where(eq(submissionAnswersTable.submissionId, submissionId))

			await tx
				.insert(submissionAnswersTable)
				.values(graded.map((answer) => ({ submissionId, ...answer })))

			await tx
				.update(submissionsTable)
				.set(computeSubmissionTotals(graded))
				.where(eq(submissionsTable.id, submissionId))

			for (const page of pages) {
				const diagnostics = pageDiagnostics.get(page.pageNumber)
				if (!diagnostics) continue

				await tx
					.update(submissionPagesTable)
					.set({ rawOcrPayload: diagnostics })
					.where(eq(submissionPagesTable.id, page.id))
			}
		})
	} catch (error) {
		await db
			.update(submissionsTable)
			.set({ status: 'failed' })
			.where(eq(submissionsTable.id, submissionId))

		throw error
	}

	const [updatedSubmission] = await db
		.select()
		.from(submissionsTable)
		.where(eq(submissionsTable.id, submissionId))

	const answers = await db
		.select()
		.from(submissionAnswersTable)
		.where(eq(submissionAnswersTable.submissionId, submissionId))

	const updatedPages = await db
		.select()
		.from(submissionPagesTable)
		.where(eq(submissionPagesTable.submissionId, submissionId))
		.orderBy(submissionPagesTable.pageNumber)

	const pagesWithUrl = await Promise.all(
		updatedPages.map(async (page) => {
			const { rawOcrPayload, ...pageFields } = page
			return {
				...pageFields,
				imageUrl: await getSubmissionPageSignedUrl(page.imageUrl),
				markersFound: extractMarkersFound(rawOcrPayload),
			}
		}),
	)

	return reply
		.status(200)
		.send({ ...updatedSubmission, pages: pagesWithUrl, answers })
}
