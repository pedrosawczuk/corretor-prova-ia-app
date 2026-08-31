import {
	db,
	eq,
	questionOptionsTable,
	questionsTable,
	submissionAnswersTable,
	submissionsTable,
} from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/core/errors'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { computeSubmissionTotals } from './compute-submission-totals'
import { fetchOwnedSubmission } from './fetch-owned-submission'
import type { ReviewSubmissionAnswerBody } from './review-submission-answer-schema'
import type { SubmissionAnswerParams } from './submission-params-schema'

export async function reviewSubmissionAnswerModule(
	request: FastifyRequest<{
		Params: SubmissionAnswerParams
		Body: ReviewSubmissionAnswerBody
	}>,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)
	const { submissionId, answerId } = request.params
	const { optionId } = request.body

	await fetchOwnedSubmission(submissionId, user.id)

	const [answer] = await db
		.select()
		.from(submissionAnswersTable)
		.where(eq(submissionAnswersTable.id, answerId))

	if (!answer || answer.submissionId !== submissionId) {
		throw new NotFoundError('Resposta não encontrada.')
	}

	const [question] = await db
		.select()
		.from(questionsTable)
		.where(eq(questionsTable.id, answer.questionId))

	const options = await db
		.select()
		.from(questionOptionsTable)
		.where(eq(questionOptionsTable.questionId, answer.questionId))

	const selectedOption = optionId
		? options.find((option) => option.id === optionId)
		: null

	if (optionId && !selectedOption) {
		throw new NotFoundError('Alternativa não encontrada para esta questão.')
	}

	const correctOption = options.find((option) => option.isCorrect)
	const finalScore =
		selectedOption && selectedOption.id === correctOption?.id
			? question.maxPoints
			: '0.00'

	await db.transaction(async (tx) => {
		await tx
			.update(submissionAnswersTable)
			.set({
				markedOptionId: selectedOption?.id ?? null,
				finalScore,
				requiresReview: false,
				reviewedBy: user.id,
			})
			.where(eq(submissionAnswersTable.id, answerId))

		const allAnswers = await tx
			.select()
			.from(submissionAnswersTable)
			.where(eq(submissionAnswersTable.submissionId, submissionId))

		await tx
			.update(submissionsTable)
			.set(computeSubmissionTotals(allAnswers))
			.where(eq(submissionsTable.id, submissionId))
	})

	const [updatedAnswer] = await db
		.select()
		.from(submissionAnswersTable)
		.where(eq(submissionAnswersTable.id, answerId))

	return reply.status(200).send(updatedAnswer)
}
