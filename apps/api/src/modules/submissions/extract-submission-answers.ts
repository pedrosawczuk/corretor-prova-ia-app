import { isMarkedAnswersReaderConfigured } from '@/lib/ai/read-page-marked-answers'
import {
	readSubmissionAnswers,
	type SubmissionPageImage,
} from '@/lib/vision/read-submission-answers'
import { combineAnswerReadings } from './combine-answer-readings'
import {
	type AiReadingQuestion,
	readAnswersWithAi,
} from './read-answers-with-ai'

export async function extractSubmissionAnswers(
	pages: SubmissionPageImage[],
	questions: AiReadingQuestion[],
) {
	const omrReading = await readSubmissionAnswers(pages, questions)

	if (!isMarkedAnswersReaderConfigured()) return omrReading

	try {
		const aiAnswers = await readAnswersWithAi(pages, questions)

		return {
			answers: combineAnswerReadings(aiAnswers, omrReading.answers),
			pageDiagnostics: omrReading.pageDiagnostics,
		}
	} catch (error) {
		console.error(
			'[extract-submission-answers] Falha na leitura por IA, usando apenas a leitura por marcadores:',
			error,
		)
		return omrReading
	}
}
