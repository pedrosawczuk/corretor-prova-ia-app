import { describe, expect, it } from 'vitest'
import { MIN_ANSWER_CONFIDENCE } from './confidence-threshold'
import {
	gradeSubmissionAnswers,
	type QuestionForGrading,
} from './grade-submission-answers'

function makeQuestion(
	overrides: Partial<QuestionForGrading> = {},
): QuestionForGrading {
	return {
		id: 'question-1',
		order: 0,
		maxPoints: '2.00',
		options: [
			{ id: 'opt-a', letter: 'A', isCorrect: false },
			{ id: 'opt-b', letter: 'B', isCorrect: true },
			{ id: 'opt-c', letter: 'C', isCorrect: false },
		],
		...overrides,
	}
}

describe('gradeSubmissionAnswers', () => {
	it('aplica a correção automaticamente quando a confiança atinge o mínimo e a marcação está correta', () => {
		const question = makeQuestion()

		const [result] = gradeSubmissionAnswers(
			[question],
			[{ order: 0, detectedLetter: 'B', confidence: MIN_ANSWER_CONFIDENCE }],
		)

		expect(result).toEqual({
			questionId: 'question-1',
			markedOptionId: 'opt-b',
			extractedText: 'B',
			confidence: MIN_ANSWER_CONFIDENCE.toFixed(2),
			aiScore: '2.00',
			finalScore: '2.00',
			requiresReview: false,
		})
	})

	it('aplica a correção automaticamente com nota zero quando a marcação lida está errada', () => {
		const question = makeQuestion()

		const [result] = gradeSubmissionAnswers(
			[question],
			[{ order: 0, detectedLetter: 'A', confidence: 0.9 }],
		)

		expect(result.markedOptionId).toBe('opt-a')
		expect(result.aiScore).toBe('0.00')
		expect(result.finalScore).toBe('0.00')
		expect(result.requiresReview).toBe(false)
	})

	it('marca para revisão manual quando a confiança fica abaixo do mínimo', () => {
		const question = makeQuestion()

		const [result] = gradeSubmissionAnswers(
			[question],
			[
				{
					order: 0,
					detectedLetter: 'B',
					confidence: MIN_ANSWER_CONFIDENCE - 0.01,
				},
			],
		)

		expect(result.requiresReview).toBe(true)
		expect(result.aiScore).toBeNull()
		expect(result.finalScore).toBeNull()
		expect(result.markedOptionId).toBe('opt-b')
		expect(result.extractedText).toBe('B')
	})

	it('marca para revisão manual quando a IA não identifica nenhuma marcação', () => {
		const question = makeQuestion()

		const [result] = gradeSubmissionAnswers(
			[question],
			[{ order: 0, detectedLetter: null, confidence: 0.95 }],
		)

		expect(result.requiresReview).toBe(true)
		expect(result.markedOptionId).toBeNull()
		expect(result.aiScore).toBeNull()
		expect(result.finalScore).toBeNull()
	})

	it('marca para revisão manual quando a letra lida não corresponde a nenhuma alternativa da questão', () => {
		const question = makeQuestion()

		const [result] = gradeSubmissionAnswers(
			[question],
			[{ order: 0, detectedLetter: 'Z', confidence: 0.95 }],
		)

		expect(result.requiresReview).toBe(true)
		expect(result.markedOptionId).toBeNull()
		expect(result.aiScore).toBeNull()
	})

	it('marca para revisão manual quando a IA não retorna nenhum resultado para a questão', () => {
		const question = makeQuestion()

		const [result] = gradeSubmissionAnswers([question], [])

		expect(result.requiresReview).toBe(true)
		expect(result.extractedText).toBeNull()
		expect(result.confidence).toBeNull()
	})

	it('compara a letra lida com as alternativas ignorando maiúsculas/minúsculas', () => {
		const question = makeQuestion()

		const [result] = gradeSubmissionAnswers(
			[question],
			[{ order: 0, detectedLetter: 'b', confidence: 0.99 }],
		)

		expect(result.markedOptionId).toBe('opt-b')
		expect(result.requiresReview).toBe(false)
	})

	it('avalia cada questão da prova de forma independente', () => {
		const questionOne = makeQuestion({ id: 'q1', order: 0 })
		const questionTwo = makeQuestion({ id: 'q2', order: 1 })

		const results = gradeSubmissionAnswers(
			[questionOne, questionTwo],
			[
				{ order: 0, detectedLetter: 'B', confidence: 0.95 },
				{ order: 1, detectedLetter: 'B', confidence: 0.5 },
			],
		)

		expect(results).toHaveLength(2)
		expect(results[0].requiresReview).toBe(false)
		expect(results[1].requiresReview).toBe(true)
	})
})
