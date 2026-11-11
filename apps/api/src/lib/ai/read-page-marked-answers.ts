import { env } from '@app/env'
import { GoogleGenAI, type Schema, Type } from '@google/genai'
import sharp from 'sharp'
import { z } from 'zod'
import { AiGenerationError } from '@/core/errors'
import {
	buildMarkedAnswersQuestionList,
	MARKED_ANSWERS_SYSTEM_INSTRUCTION,
	type MarkedAnswersQuestion,
} from './marked-answers-prompt'
import { resolveMarkedLetters } from './resolve-marked-letters'
import { withGeminiRetry } from './with-gemini-retry'
import { withModelFallback } from './with-model-fallback'

const AI_IMAGE_MAX_DIMENSION_PX = 3072

const pageMarkedAnswersSchema = z.object({
	answers: z.array(
		z.object({
			number: z.number().int(),
			visible: z.boolean(),
			legible: z.boolean(),
			options: z.array(
				z.object({
					printedLetter: z.string(),
					printedTextStart: z.string(),
					marked: z.boolean(),
				}),
			),
		}),
	),
})

export interface PageMarkedAnswer {
	number: number
	markedLetters: string[]
	legible: boolean
}

const responseSchema: Schema = {
	type: Type.OBJECT,
	properties: {
		answers: {
			type: Type.ARRAY,
			items: {
				type: Type.OBJECT,
				properties: {
					number: { type: Type.INTEGER },
					visible: { type: Type.BOOLEAN },
					legible: { type: Type.BOOLEAN },
					options: {
						type: Type.ARRAY,
						items: {
							type: Type.OBJECT,
							properties: {
								printedLetter: { type: Type.STRING },
								printedTextStart: { type: Type.STRING },
								marked: { type: Type.BOOLEAN },
							},
							required: ['printedLetter', 'printedTextStart', 'marked'],
						},
					},
				},
				required: ['number', 'visible', 'legible', 'options'],
			},
		},
	},
	required: ['answers'],
}

export function isMarkedAnswersReaderConfigured(): boolean {
	return Boolean(env.GEMINI_API_KEY)
}

async function prepareImageForAi(image: Buffer): Promise<string> {
	const prepared = await sharp(image)
		.rotate()
		.resize(AI_IMAGE_MAX_DIMENSION_PX, AI_IMAGE_MAX_DIMENSION_PX, {
			fit: 'inside',
			withoutEnlargement: true,
		})
		.jpeg({ quality: 90 })
		.toBuffer()

	return prepared.toString('base64')
}

export async function readPageMarkedAnswers(
	image: Buffer,
	questions: MarkedAnswersQuestion[],
): Promise<PageMarkedAnswer[]> {
	if (!env.GEMINI_API_KEY) {
		throw new AiGenerationError(
			'Serviço de leitura por IA não está configurado.',
		)
	}

	const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
	const imageBase64 = await prepareImageForAi(image)

	const response = await withModelFallback(
		[env.GEMINI_MODEL, env.GEMINI_READING_FALLBACK_MODEL],
		(model) =>
			withGeminiRetry(() =>
				genAI.models.generateContent({
					model,
					contents: [
						{
							role: 'user',
							parts: [
								{ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
								{ text: buildMarkedAnswersQuestionList(questions) },
							],
						},
					],
					config: {
						systemInstruction: MARKED_ANSWERS_SYSTEM_INSTRUCTION,
						temperature: 0,
						responseMimeType: 'application/json',
						responseSchema,
					},
				}),
			),
	)

	if (!response.text) {
		throw new AiGenerationError('A IA não retornou a leitura da página.')
	}

	const { answers } = pageMarkedAnswersSchema.parse(JSON.parse(response.text))

	return answers.flatMap((answer) => {
		const question = questions.find((q) => q.number === answer.number)
		if (!answer.visible || !question) return []

		const markedLetters = resolveMarkedLetters(question, answer.options)

		return [
			{
				number: answer.number,
				markedLetters: markedLetters ?? [],
				legible: answer.legible && markedLetters !== null,
			},
		]
	})
}
