import type { ExtractedAnswer } from '@/lib/vision/read-submission-answers'
import { MIN_ANSWER_CONFIDENCE } from './confidence-threshold'

export type { ExtractedAnswer }

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

export interface GradedAnswer {
	questionId: string
	markedOptionId: string | null
	extractedText: string | null
	confidence: string | null
	aiScore: string | null
	finalScore: string | null
	requiresReview: boolean
}

const ZERO_SCORE = '0.00'

function findOptionByLetter(
	options: QuestionOptionForGrading[],
	letter: string | undefined,
) {
	if (!letter) return null

	return (
		options.find(
			(option) => option.letter.toUpperCase() === letter.toUpperCase(),
		) ?? null
	)
}

function formatMarkedLetters(markedLetters: string[]): string | null {
	return markedLetters.length > 0 ? markedLetters.join(',') : null
}

function scoreReadAnswer(
	question: QuestionForGrading,
	markedLetters: string[],
) {
	if (markedLetters.length === 0) return null

	if (markedLetters.length > 1) {
		return { markedOptionId: null, score: ZERO_SCORE }
	}

	const markedOption = findOptionByLetter(question.options, markedLetters[0])
	if (!markedOption) return null

	const correctOption = question.options.find((option) => option.isCorrect)
	const score =
		markedOption.id === correctOption?.id ? question.maxPoints : ZERO_SCORE

	return { markedOptionId: markedOption.id, score }
}

export function gradeSubmissionAnswers(
	questions: QuestionForGrading[],
	extractedAnswers: ExtractedAnswer[],
): GradedAnswer[] {
	return questions.map((question) => {
		const extracted = extractedAnswers.find((a) => a.order === question.order)
		const markedLetters = extracted?.markedLetters ?? []
		const confidence = extracted?.confidence ?? null
		const extractedText = formatMarkedLetters(markedLetters)
		const formattedConfidence =
			confidence === null ? null : confidence.toFixed(2)

		const isConfident =
			confidence !== null && confidence >= MIN_ANSWER_CONFIDENCE
		const scored = isConfident ? scoreReadAnswer(question, markedLetters) : null

		if (!scored) {
			const hintedOption =
				markedLetters.length === 1
					? findOptionByLetter(question.options, markedLetters[0])
					: null

			return {
				questionId: question.id,
				markedOptionId: hintedOption?.id ?? null,
				extractedText,
				confidence: formattedConfidence,
				aiScore: null,
				finalScore: null,
				requiresReview: true,
			}
		}

		return {
			questionId: question.id,
			markedOptionId: scored.markedOptionId,
			extractedText,
			confidence: formattedConfidence,
			aiScore: scored.score,
			finalScore: scored.score,
			requiresReview: false,
		}
	})
}
