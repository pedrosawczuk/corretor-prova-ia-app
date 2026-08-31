import type { Exam, Question, Submission, SubmissionAnswer } from '@app/shared'

export interface QuestionWithAnswer {
	question: Question
	answer: SubmissionAnswer | undefined
}

export function pairQuestionsWithAnswers(
	exam: Exam,
	submission: Submission,
): QuestionWithAnswer[] {
	return [...exam.questions]
		.sort((a, b) => a.order - b.order)
		.map((question) => ({
			question,
			answer: submission.answers.find((a) => a.questionId === question.id),
		}))
}

export function countPendingReview(submission: Submission): number {
	return submission.answers.filter((answer) => answer.requiresReview).length
}
