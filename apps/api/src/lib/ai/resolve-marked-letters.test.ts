import { describe, expect, it } from 'vitest'
import type { MarkedAnswersQuestion } from './marked-answers-prompt'
import { resolveMarkedLetters } from './resolve-marked-letters'

const question: MarkedAnswersQuestion = {
	number: 1,
	statement: 'A participação do Brasil na Segunda Guerra Mundial',
	options: [
		{
			letter: 'A',
			text: 'Enviar tropas compostas apenas por opositores políticos para serem sacrificados no front.',
		},
		{
			letter: 'B',
			text: 'Combater ditaduras fascistas na Europa enquanto mantinha internamente o regime autoritário do Estado Novo.',
		},
		{
			letter: 'C',
			text: 'Financiar a reconstrução europeia enquanto enfrentava uma grave recessão interna.',
		},
		{
			letter: 'D',
			text: 'Apoiar os Estados Unidos mas manter acordos militares secretos com a União Soviética.',
		},
	],
}

const trueFalse: MarkedAnswersQuestion = {
	number: 2,
	statement: 'Afirmação',
	options: [
		{ letter: 'V', text: 'Verdadeiro' },
		{ letter: 'F', text: 'Falso' },
	],
}

describe('resolveMarkedLetters', () => {
	it('usa a letra do gabarito, não a impressa, quando a prova foi editada depois de impressa', () => {
		const result = resolveMarkedLetters(question, [
			{
				printedLetter: 'A',
				printedTextStart: 'Combater ditaduras fascistas na Europa enquanto',
				marked: true,
			},
			{
				printedLetter: 'D',
				printedTextStart: 'Enviar tropas compostas apenas por',
				marked: false,
			},
		])

		expect(result).toEqual(['B'])
	})

	it('tolera acentos, pontuação e pequenos erros de transcrição', () => {
		const result = resolveMarkedLetters(question, [
			{
				printedLetter: 'C',
				printedTextStart: 'financiar a reconstrucao europeia, enquanto',
				marked: true,
			},
		])

		expect(result).toEqual(['C'])
	})

	it('devolve todas as letras quando mais de uma alternativa foi marcada', () => {
		const result = resolveMarkedLetters(question, [
			{
				printedLetter: 'D',
				printedTextStart: 'Apoiar os Estados Unidos mas',
				marked: true,
			},
			{
				printedLetter: 'B',
				printedTextStart: 'Combater ditaduras fascistas',
				marked: true,
			},
		])

		expect(result).toEqual(['B', 'D'])
	})

	it('devolve lista vazia quando nenhuma alternativa está marcada', () => {
		const result = resolveMarkedLetters(trueFalse, [
			{ printedLetter: 'V', printedTextStart: 'Verdadeiro', marked: false },
			{ printedLetter: 'F', printedTextStart: 'Falso', marked: false },
		])

		expect(result).toEqual([])
	})

	it('resolve verdadeiro ou falso pelo texto', () => {
		const result = resolveMarkedLetters(trueFalse, [
			{ printedLetter: 'F', printedTextStart: 'Falso', marked: true },
		])

		expect(result).toEqual(['F'])
	})

	it('não arrisca uma letra quando o texto transcrito não corresponde a nenhuma alternativa', () => {
		const result = resolveMarkedLetters(question, [
			{
				printedLetter: 'A',
				printedTextStart: 'texto que não existe nesta questão',
				marked: true,
			},
		])

		expect(result).toBeNull()
	})
})
