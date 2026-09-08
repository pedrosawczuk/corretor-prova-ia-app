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

export function getMisalignedPageNumbers(submission: Submission): number[] {
	return submission.pages
		.filter((page) => page.markersFound === false)
		.map((page) => page.pageNumber)
		.sort((a, b) => a - b)
}

export function buildMisalignedPagesWarning(pageNumbers: number[]): string {
	if (pageNumbers.length === 1) {
		return `A página ${pageNumbers[0]} não pôde ser alinhada automaticamente — todas as questões dela precisam de revisão manual.`
	}

	return `As páginas ${pageNumbers.join(', ')} não puderam ser alinhadas automaticamente — todas as questões delas precisam de revisão manual.`
}
