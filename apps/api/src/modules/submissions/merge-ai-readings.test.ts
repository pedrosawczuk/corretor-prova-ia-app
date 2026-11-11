import { describe, expect, it } from 'vitest'
import {
	AI_CONSENSUS_CONFIDENCE,
	AI_DIVERGENT_CONFIDENCE,
	type AiReadableQuestion,
	mergeAiReadings,
} from './merge-ai-readings'

const multipleChoice: AiReadableQuestion = {
	order: 0,
	number: 1,
	letters: ['A', 'B', 'C', 'D'],
}

const trueFalse: AiReadableQuestion = {
	order: 1,
	number: 2,
	letters: ['V', 'F'],
}

describe('mergeAiReadings', () => {
	it('lê com confiança alta quando as duas leituras concordam', () => {
		const pass = [[{ number: 1, markedLetters: ['C'], legible: true }]]

		const [result] = mergeAiReadings([multipleChoice], [pass, pass])

		expect(result).toEqual({
			order: 0,
			markedLetters: ['C'],
			confidence: AI_CONSENSUS_CONFIDENCE,
		})
	})

	it('mantém todas as letras quando o aluno marcou mais de uma alternativa', () => {
		const pass = [[{ number: 1, markedLetters: ['D', 'b'], legible: true }]]

		const [result] = mergeAiReadings([multipleChoice], [pass, pass])

		expect(result.markedLetters).toEqual(['B', 'D'])
		expect(result.confidence).toBe(AI_CONSENSUS_CONFIDENCE)
	})

	it('confirma questão em branco quando as duas leituras não veem marcação', () => {
		const pass = [[{ number: 2, markedLetters: [], legible: true }]]

		const [result] = mergeAiReadings([trueFalse], [pass, pass])

		expect(result).toEqual({
			order: 1,
			markedLetters: [],
			confidence: AI_CONSENSUS_CONFIDENCE,
		})
	})

	it('reduz a confiança quando as leituras divergem', () => {
		const [result] = mergeAiReadings(
			[multipleChoice],
			[
				[[{ number: 1, markedLetters: ['A'], legible: true }]],
				[[{ number: 1, markedLetters: ['B'], legible: true }]],
			],
		)

		expect(result.markedLetters).toEqual(['A'])
		expect(result.confidence).toBe(AI_DIVERGENT_CONFIDENCE)
	})

	it('reduz a confiança quando uma das leituras considera a questão ilegível', () => {
		const [result] = mergeAiReadings(
			[multipleChoice],
			[
				[[{ number: 1, markedLetters: ['A'], legible: true }]],
				[[{ number: 1, markedLetters: [], legible: false }]],
			],
		)

		expect(result.confidence).toBe(AI_DIVERGENT_CONFIDENCE)
	})

	it('fica sem leitura quando a questão não aparece em nenhuma página', () => {
		const [result] = mergeAiReadings([multipleChoice], [[[]], [[]]])

		expect(result).toEqual({ order: 0, markedLetters: [], confidence: 0 })
	})

	it('trata letra fora das alternativas da questão como leitura inválida', () => {
		const pass = [[{ number: 2, markedLetters: ['A'], legible: true }]]

		const [result] = mergeAiReadings([trueFalse], [pass, pass])

		expect(result.confidence).toBe(0)
	})

	it('junta a leitura de uma questão que aparece em duas páginas', () => {
		const pass = [
			[{ number: 1, markedLetters: [], legible: true }],
			[{ number: 1, markedLetters: ['D'], legible: true }],
		]

		const [result] = mergeAiReadings([multipleChoice], [pass, pass])

		expect(result.markedLetters).toEqual(['D'])
		expect(result.confidence).toBe(AI_CONSENSUS_CONFIDENCE)
	})

	it('não confirma questão em branco quando outra página a mostrou ilegível', () => {
		const pass = [
			[{ number: 1, markedLetters: [], legible: true }],
			[{ number: 1, markedLetters: [], legible: false }],
		]

		const [result] = mergeAiReadings([multipleChoice], [pass, pass])

		expect(result.confidence).toBe(0)
	})
})
