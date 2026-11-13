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
const AI_READING_CONCURRENCY = 4

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

	const passes: Awaited<ReturnType<typeof readPageMarkedAnswers>>[][] =
		Array.from({ length: AI_READING_PASSES }, () => new Array(pages.length))

	const tasks: Array<{ passIndex: number; pageIndex: number }> = []
	for (let passIndex = 0; passIndex < AI_READING_PASSES; passIndex++) {
		for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
			tasks.push({ passIndex, pageIndex })
		}
	}

	let nextTaskIndex = 0
	const workerCount = Math.min(AI_READING_CONCURRENCY, tasks.length)
	await Promise.all(
		Array.from({ length: workerCount }, async () => {
			while (nextTaskIndex < tasks.length) {
				const currentIndex = nextTaskIndex++
				const { passIndex, pageIndex } = tasks[currentIndex]
				passes[passIndex][pageIndex] = await readPageMarkedAnswers(
					pages[pageIndex].data,
					promptQuestions,
				)
			}
		}),
	)

	return mergeAiReadings(readableQuestions, passes)
}
