import type { PageMarkedAnswer } from '@/lib/ai/read-page-marked-answers'
import type { ExtractedAnswer } from '@/lib/vision/read-submission-answers'

export const AI_CONSENSUS_CONFIDENCE = 0.95
export const AI_DIVERGENT_CONFIDENCE = 0.3

export interface AiReadableQuestion {
	order: number
	number: number
	letters: string[]
}

export type AiReadingPass = PageMarkedAnswer[][]

type PassVerdict = { readable: true; letters: string[] } | { readable: false }

function readQuestionInPass(
	pass: AiReadingPass,
	question: AiReadableQuestion,
): PassVerdict {
	const entries = pass
		.flat()
		.filter((entry) => entry.number === question.number)
	const validLetters = new Set(question.letters.map((l) => l.toUpperCase()))

	const normalizedEntries = entries.map((entry) => ({
		legible: entry.legible,
		letters: entry.markedLetters.map((letter) => letter.trim().toUpperCase()),
	}))

	const hasUnknownLetter = normalizedEntries.some((entry) =>
		entry.letters.some((letter) => !validLetters.has(letter)),
	)

	const legibleEntries = normalizedEntries.filter((entry) => entry.legible)

	if (hasUnknownLetter || legibleEntries.length === 0) {
		return { readable: false }
	}

	const letters = [
		...new Set(legibleEntries.flatMap((entry) => entry.letters)),
	].sort()

	const hasIllegibleEntry = legibleEntries.length < normalizedEntries.length

	if (letters.length === 0 && hasIllegibleEntry) {
		return { readable: false }
	}

	return { readable: true, letters }
}

function haveSameLetters(a: string[], b: string[]): boolean {
	return (
		a.length === b.length && a.every((letter, index) => letter === b[index])
	)
}

export function mergeAiReadings(
	questions: AiReadableQuestion[],
	passes: AiReadingPass[],
): ExtractedAnswer[] {
	return questions.map((question) => {
		const verdicts = passes.map((pass) => readQuestionInPass(pass, question))
		const readings = verdicts.flatMap((verdict) =>
			verdict.readable ? [verdict.letters] : [],
		)

		const [firstReading] = readings

		if (!firstReading) {
			return { order: question.order, markedLetters: [], confidence: 0 }
		}

		const isConsensus =
			readings.length === verdicts.length &&
			readings.every((reading) => haveSameLetters(reading, firstReading))

		return {
			order: question.order,
			markedLetters: firstReading,
			confidence: isConsensus
				? AI_CONSENSUS_CONFIDENCE
				: AI_DIVERGENT_CONFIDENCE,
		}
	})
}
