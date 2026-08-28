import { GoogleGenAI } from '@google/genai'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AiGenerationError } from '@/core/errors'
import { generateExamQuestions } from './gemini'

const generateContentMock = vi.fn()

vi.mock('@google/genai', () => {
	const GoogleGenAI = vi.fn().mockImplementation(function GoogleGenAI(this: {
		models: { generateContent: typeof generateContentMock }
	}) {
		this.models = {
			generateContent: generateContentMock,
		}
	})

	return {
		GoogleGenAI,
		Type: {
			ARRAY: 'ARRAY',
			OBJECT: 'OBJECT',
			STRING: 'STRING',
			BOOLEAN: 'BOOLEAN',
		},
	}
})

vi.mock('@app/env', () => ({
	env: {
		GEMINI_API_KEY: 'test-api-key' as string | undefined,
		GEMINI_MODEL: 'gemini-2.5-flash',
	},
}))

const { env } = await import('@app/env')

describe('generateExamQuestions', () => {
	const params = {
		subject: 'Matemática',
		difficulty: 5,
		questionCount: 2,
		questionType: 'multiple_choice' as const,
	}

	beforeEach(() => {
		vi.clearAllMocks()
		env.GEMINI_API_KEY = 'test-api-key'
	})

	it('retorna as questões geradas quando a resposta da IA é válida', async () => {
		const questions = [
			{
				statement: 'Quanto é 2 + 2?',
				options: [
					{ letter: 'A', text: '3', isCorrect: false },
					{ letter: 'B', text: '4', isCorrect: true },
					{ letter: 'C', text: '5', isCorrect: false },
					{ letter: 'D', text: '6', isCorrect: false },
				],
			},
		]

		generateContentMock.mockResolvedValue({ text: JSON.stringify(questions) })

		const result = await generateExamQuestions(params)

		expect(result).toEqual(questions)
		expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' })
	})

	it('lança AiGenerationError quando a resposta da IA é um JSON malformado', async () => {
		generateContentMock.mockResolvedValue({ text: '{ not valid json' })

		await expect(generateExamQuestions(params)).rejects.toThrow(
			AiGenerationError,
		)
	})

	it('lança AiGenerationError quando uma questão não tem exatamente uma alternativa correta', async () => {
		const questions = [
			{
				statement: 'Quanto é 2 + 2?',
				options: [
					{ letter: 'A', text: '3', isCorrect: false },
					{ letter: 'B', text: '4', isCorrect: true },
					{ letter: 'C', text: '5', isCorrect: true },
					{ letter: 'D', text: '6', isCorrect: false },
				],
			},
		]

		generateContentMock.mockResolvedValue({ text: JSON.stringify(questions) })

		await expect(generateExamQuestions(params)).rejects.toThrow(
			AiGenerationError,
		)
	})

	it('lança AiGenerationError sem chamar o SDK quando GEMINI_API_KEY não está configurada', async () => {
		env.GEMINI_API_KEY = undefined

		await expect(generateExamQuestions(params)).rejects.toThrow(
			AiGenerationError,
		)
		expect(GoogleGenAI).not.toHaveBeenCalled()
		expect(generateContentMock).not.toHaveBeenCalled()
	})
})
