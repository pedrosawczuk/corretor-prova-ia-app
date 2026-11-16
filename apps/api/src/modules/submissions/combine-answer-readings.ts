import type { ExtractedAnswer } from '@/lib/vision/read-submission-answers'
import { MIN_ANSWER_CONFIDENCE } from './confidence-threshold'

export const READERS_DISAGREEMENT_CONFIDENCE = 0.3
export const UNCORROBORATED_AI_CONFIDENCE = 0.7

function isConfidentSingleMark(answer: ExtractedAnswer): boolean {
	return (
		answer.confidence !== null &&
		answer.confidence >= MIN_ANSWER_CONFIDENCE &&
		answer.markedLetters.length === 1
	)
}

function haveSameLetters(a: string[], b: string[]): boolean {
	const sortedA = [...a].sort()
	const sortedB = [...b].sort()
	return (
		sortedA.length === sortedB.length &&
		sortedA.every((letter, index) => letter === sortedB[index])
	)
}

export function combineAnswerReadings(
	aiAnswers: ExtractedAnswer[],
	omrAnswers: ExtractedAnswer[],
): ExtractedAnswer[] {
	return aiAnswers.map((aiAnswer) => {
		const omrAnswer = omrAnswers.find(
			(answer) => answer.order === aiAnswer.order,
		)

		const hasConfidentOmr =
			omrAnswer !== undefined && isConfidentSingleMark(omrAnswer)

		if (!hasConfidentOmr) {
			return {
				...aiAnswer,
				confidence: Math.min(
					aiAnswer.confidence ?? 0,
					UNCORROBORATED_AI_CONFIDENCE,
				),
			}
		}

		const readersDisagree = !haveSameLetters(
			aiAnswer.markedLetters,
			omrAnswer.markedLetters,
		)

		if (!readersDisagree) return aiAnswer

		return {
			...aiAnswer,
			confidence: Math.min(
				aiAnswer.confidence ?? 0,
				READERS_DISAGREEMENT_CONFIDENCE,
			),
		}
	})
}
