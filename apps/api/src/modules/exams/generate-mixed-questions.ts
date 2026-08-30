import { type GeneratedQuestion, generateExamQuestions } from '@/lib/ai/gemini'
import { shuffle } from './shuffle'

export type GeneratedQuestionWithType = GeneratedQuestion & {
	type: 'multiple_choice' | 'true_false'
}

interface GenerateMixedQuestionsParams {
	subject: string
	difficulty: number
	questionCount: number
	multipleChoiceCount: number
}

export async function generateMixedQuestions({
	subject,
	difficulty,
	questionCount,
	multipleChoiceCount,
}: GenerateMixedQuestionsParams): Promise<GeneratedQuestionWithType[]> {
	const trueFalseCount = questionCount - multipleChoiceCount

	const [multipleChoiceQuestions, trueFalseQuestions] = await Promise.all([
		multipleChoiceCount > 0
			? generateExamQuestions({
					subject,
					difficulty,
					questionCount: multipleChoiceCount,
					questionType: 'multiple_choice',
				})
			: Promise.resolve([]),
		trueFalseCount > 0
			? generateExamQuestions({
					subject,
					difficulty,
					questionCount: trueFalseCount,
					questionType: 'true_false',
				})
			: Promise.resolve([]),
	])

	return shuffle([
		...multipleChoiceQuestions.map((question) => ({
			...question,
			type: 'multiple_choice' as const,
		})),
		...trueFalseQuestions.map((question) => ({
			...question,
			type: 'true_false' as const,
		})),
	])
}
