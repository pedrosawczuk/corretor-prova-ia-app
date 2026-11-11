import { describe, expect, it } from 'vitest'
import {
	combineAnswerReadings,
	READERS_DISAGREEMENT_CONFIDENCE,
} from './combine-answer-readings'

describe('combineAnswerReadings', () => {
	it('usa a leitura da IA quando a leitura por marcadores não é confiável', () => {
		const result = combineAnswerReadings(
			[{ order: 0, markedLetters: ['B'], confidence: 0.95 }],
			[{ order: 0, markedLetters: ['A'], confidence: 0.2 }],
		)

		expect(result).toEqual([
			{ order: 0, markedLetters: ['B'], confidence: 0.95 },
		])
	})

	it('mantém a confiança quando as duas leituras concordam', () => {
		const result = combineAnswerReadings(
			[{ order: 0, markedLetters: ['B'], confidence: 0.95 }],
			[{ order: 0, markedLetters: ['B'], confidence: 0.9 }],
		)

		expect(result[0].confidence).toBe(0.95)
	})

	it('manda para revisão quando a leitura por marcadores confiável discorda da IA', () => {
		const result = combineAnswerReadings(
			[{ order: 0, markedLetters: ['B'], confidence: 0.95 }],
			[{ order: 0, markedLetters: ['C'], confidence: 0.9 }],
		)

		expect(result[0]).toEqual({
			order: 0,
			markedLetters: ['B'],
			confidence: READERS_DISAGREEMENT_CONFIDENCE,
		})
	})

	it('usa a leitura da IA quando não há leitura por marcadores para a questão', () => {
		const result = combineAnswerReadings(
			[{ order: 3, markedLetters: ['A', 'C'], confidence: 0.95 }],
			[],
		)

		expect(result[0]).toEqual({
			order: 3,
			markedLetters: ['A', 'C'],
			confidence: 0.95,
		})
	})
})
