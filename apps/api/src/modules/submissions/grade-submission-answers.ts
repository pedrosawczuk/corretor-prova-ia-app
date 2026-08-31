import { MIN_ANSWER_CONFIDENCE } from './confidence-threshold'

export interface QuestionOptionForGrading {
	id: string
	letter: string
	isCorrect: boolean
}

export interface QuestionForGrading {
	id: string
	order: number
	maxPoints: string
	options: QuestionOptionForGrading[]
}

export interface ExtractedAnswer {
	order: number
	detectedLetter: string | null
	confidence: number | null
}

export interface GradedAnswer {
	questionId: string
	markedOptionId: string | null
	extractedText: string | null
	confidence: string | null
	aiScore: string | null
	finalScore: string | null
	requiresReview: boolean
}

function findMarkedOption(
	options: QuestionOptionForGrading[],
	detectedLetter: string | null,
) {
	if (!detectedLetter) return null

	return (
		options.find(
			(option) => option.letter.toUpperCase() === detectedLetter.toUpperCase(),
		) ?? null
	)
}

export function gradeSubmissionAnswers(
	questions: QuestionForGrading[],
	extractedAnswers: ExtractedAnswer[],
): GradedAnswer[] {
	return questions.map((question) => {
		const extracted = extractedAnswers.find((a) => a.order === question.order)

		const markedOption = extracted
			? findMarkedOption(question.options, extracted.detectedLetter)
			: null

		const confidence = extracted?.confidence ?? null

		const requiresReview =
			!extracted ||
			confidence === null ||
			confidence < MIN_ANSWER_CONFIDENCE ||
			!markedOption

		if (requiresReview) {
			return {
				questionId: question.id,
				markedOptionId: markedOption?.id ?? null,
				extractedText: extracted?.detectedLetter ?? null,
				confidence: confidence === null ? null : confidence.toFixed(2),
				aiScore: null,
				finalScore: null,
				requiresReview: true,
			}
		}

		const correctOption = question.options.find((option) => option.isCorrect)
		const score =
			markedOption.id === correctOption?.id ? question.maxPoints : '0.00'

		return {
			questionId: question.id,
			markedOptionId: markedOption.id,
			extractedText: extracted.detectedLetter,
			confidence: confidence.toFixed(2),
			aiScore: score,
			finalScore: score,
			requiresReview: false,
		}
	})
}
