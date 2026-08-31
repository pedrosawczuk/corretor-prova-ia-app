import {
	db,
	eq,
	submissionAnswersTable,
	submissionPagesTable,
	submissionsTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { BadRequestError, ConflictError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { downloadSubmissionPage } from '@/lib/storage/storage'
import { readSubmissionAnswers } from '@/lib/vision/read-submission-answers'
import { fetchQuestionsWithOptions } from '@/modules/exams/fetch-exam-detail'
import { computeSubmissionTotals } from './compute-submission-totals'
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

	await db
		.update(submissionsTable)
		.set({ status: 'processing' })
		.where(eq(submissionsTable.id, submissionId))

	try {
		const pageImages = await Promise.all(
			pages.map(async (page) => ({
				pageNumber: page.pageNumber,
				data: await downloadSubmissionPage(page.imageUrl),
			})),
		)

		const extracted = await readSubmissionAnswers(pageImages, questions)

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

	return reply.status(200).send({ ...updatedSubmission, answers })
}
