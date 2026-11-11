import type { MarkedAnswersQuestion } from './marked-answers-prompt'

export interface PrintedOptionReading {
	printedLetter: string
	printedTextStart: string
	marked: boolean
}

const MIN_TEXT_MATCH_SCORE = 0.6
const MIN_TEXT_MATCH_MARGIN = 0.2
const EXTRA_COMPARED_WORDS = 3

function tokenize(text: string): string[] {
	return text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter(Boolean)
}

function scoreTextMatch(printedTokens: string[], optionText: string): number {
	if (printedTokens.length === 0) return 0

	const comparedTokens = new Set(
		tokenize(optionText).slice(0, printedTokens.length + EXTRA_COMPARED_WORDS),
	)
	const matches = printedTokens.filter((token) => comparedTokens.has(token))

	return matches.length / printedTokens.length
}

function findLetterByText(
	question: MarkedAnswersQuestion,
	printedTextStart: string,
): string | null {
	const printedTokens = tokenize(printedTextStart)

	const ranked = question.options
		.map((option) => ({
			letter: option.letter,
			score: scoreTextMatch(printedTokens, option.text),
		}))
		.sort((a, b) => b.score - a.score)

	const [best, second] = ranked
	if (!best || best.score < MIN_TEXT_MATCH_SCORE) return null
	if (second && best.score - second.score < MIN_TEXT_MATCH_MARGIN) return null

	return best.letter
}

export function resolveMarkedLetters(
	question: MarkedAnswersQuestion,
	printedOptions: PrintedOptionReading[],
): string[] | null {
	const resolved: string[] = []

	for (const option of printedOptions.filter((printed) => printed.marked)) {
		const letter = findLetterByText(question, option.printedTextStart)
		if (!letter) return null
		resolved.push(letter)
	}

	return [...new Set(resolved)].sort()
}
