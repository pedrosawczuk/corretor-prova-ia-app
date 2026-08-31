export interface AnswerForTotals {
	finalScore: string | null
	requiresReview: boolean
}

export function computeSubmissionTotals(answers: AnswerForTotals[]) {
	const needsReview = answers.some((answer) => answer.requiresReview)

	const totalScore = answers.reduce(
		(sum, answer) =>
			sum + (answer.finalScore !== null ? Number(answer.finalScore) : 0),
		0,
	)

	return {
		status: needsReview ? ('needs_review' as const) : ('completed' as const),
		totalScore: totalScore.toFixed(2),
		correctedAt: needsReview ? null : new Date(),
	}
}
