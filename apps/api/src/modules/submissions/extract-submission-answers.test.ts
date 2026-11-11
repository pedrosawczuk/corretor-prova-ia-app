import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	isMarkedAnswersReaderConfigured,
	readPageMarkedAnswers,
} from '@/lib/ai/read-page-marked-answers'
import { readSubmissionAnswers } from '@/lib/vision/read-submission-answers'
import { extractSubmissionAnswers } from './extract-submission-answers'
import { AI_CONSENSUS_CONFIDENCE } from './merge-ai-readings'
import type { AiReadingQuestion } from './read-answers-with-ai'

vi.mock('@/lib/ai/read-page-marked-answers', () => ({
	isMarkedAnswersReaderConfigured: vi.fn(),
	readPageMarkedAnswers: vi.fn(),
}))

vi.mock('@/lib/vision/read-submission-answers', () => ({
	readSubmissionAnswers: vi.fn(),
}))

function makeOption(letter: string) {
	return {
		id: `opt-${letter}`,
		letter,
		text: `Texto ${letter}`,
		markerPage: null,
		markerX: null,
		markerY: null,
	}
}

const questions: AiReadingQuestion[] = [
	{
		order: 1,
		statement: 'Enunciado verdadeiro ou falso',
		options: ['V', 'F'].map(makeOption),
	},
	{
		order: 0,
		statement: 'Enunciado de múltipla escolha',
		options: ['A', 'B', 'C', 'D'].map(makeOption),
	},
]

const pages = [{ pageNumber: 1, data: Buffer.from('page') }]

const omrReading = {
	answers: [
		{ order: 0, markedLetters: [], confidence: 0 },
		{ order: 1, markedLetters: [], confidence: 0 },
	],
	pageDiagnostics: new Map([[1, { markersFound: false }]]),
}

describe('extractSubmissionAnswers', () => {
	beforeEach(() => {
		vi.mocked(readSubmissionAnswers).mockResolvedValue(omrReading)
	})

	it('usa só a leitura por marcadores quando a IA não está configurada', async () => {
		vi.mocked(isMarkedAnswersReaderConfigured).mockReturnValue(false)

		const result = await extractSubmissionAnswers(pages, questions)

		expect(result).toBe(omrReading)
		expect(readPageMarkedAnswers).not.toHaveBeenCalled()
	})

	it('lê com a IA usando o número impresso de cada questão, mesmo sem marcadores na foto', async () => {
		vi.mocked(isMarkedAnswersReaderConfigured).mockReturnValue(true)
		vi.mocked(readPageMarkedAnswers).mockResolvedValue([
			{ number: 1, markedLetters: ['B', 'D'], legible: true },
			{ number: 2, markedLetters: ['F'], legible: true },
		])

		const result = await extractSubmissionAnswers(pages, questions)

		expect(readPageMarkedAnswers).toHaveBeenCalledTimes(2)
		expect(readPageMarkedAnswers).toHaveBeenCalledWith(pages[0].data, [
			{
				number: 1,
				statement: 'Enunciado de múltipla escolha',
				options: ['A', 'B', 'C', 'D'].map((letter) => ({
					letter,
					text: `Texto ${letter}`,
				})),
			},
			{
				number: 2,
				statement: 'Enunciado verdadeiro ou falso',
				options: ['V', 'F'].map((letter) => ({
					letter,
					text: `Texto ${letter}`,
				})),
			},
		])
		expect(result.answers).toEqual([
			{
				order: 0,
				markedLetters: ['B', 'D'],
				confidence: AI_CONSENSUS_CONFIDENCE,
			},
			{ order: 1, markedLetters: ['F'], confidence: AI_CONSENSUS_CONFIDENCE },
		])
		expect(result.pageDiagnostics).toBe(omrReading.pageDiagnostics)
	})

	it('volta para a leitura por marcadores quando a IA falha', async () => {
		vi.mocked(isMarkedAnswersReaderConfigured).mockReturnValue(true)
		vi.mocked(readPageMarkedAnswers).mockRejectedValue(new Error('offline'))
		vi.spyOn(console, 'error').mockImplementation(() => undefined)

		const result = await extractSubmissionAnswers(pages, questions)

		expect(result).toBe(omrReading)
	})
})
