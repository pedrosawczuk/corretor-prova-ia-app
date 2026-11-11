import type { MarkedAnswersQuestion } from '@/lib/ai/marked-answers-prompt'
import { readPageMarkedAnswers } from '@/lib/ai/read-page-marked-answers'
import type {
	ExtractedAnswer,
	OmrOption,
	OmrQuestion,
	SubmissionPageImage,
} from '@/lib/vision/read-submission-answers'
import { type AiReadableQuestion, mergeAiReadings } from './merge-ai-readings'

const AI_READING_PASSES = 2

export interface AiReadingQuestion extends OmrQuestion {
	statement: string
	options: (OmrOption & { text: string })[]
}

export async function readAnswersWithAi(
	pages: SubmissionPageImage[],
	questions: AiReadingQuestion[],
): Promise<ExtractedAnswer[]> {
	const sortedQuestions = [...questions].sort((a, b) => a.order - b.order)

	const readableQuestions: AiReadableQuestion[] = sortedQuestions.map(
		(question, index) => ({
			order: question.order,
			number: index + 1,
			letters: question.options.map((option) => option.letter),
		}),
	)

	const promptQuestions: MarkedAnswersQuestion[] = sortedQuestions.map(
		(question, index) => ({
			number: index + 1,
			statement: question.statement,
			options: question.options.map(({ letter, text }) => ({ letter, text })),
		}),
	)

	const passes = await Promise.all(
		Array.from({ length: AI_READING_PASSES }, () =>
			Promise.all(
				pages.map((page) => readPageMarkedAnswers(page.data, promptQuestions)),
			),
		),
	)

	return mergeAiReadings(readableQuestions, passes)
}
