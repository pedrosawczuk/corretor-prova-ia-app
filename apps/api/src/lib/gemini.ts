import { env } from '@app/env'
import { GoogleGenAI, type Schema, Type } from '@google/genai'
import { z } from 'zod'
import { AiGenerationError } from '@/core/errors'

export interface GenerateQuestionsParams {
	subject: string
	difficulty: number
	questionCount: number
	questionType: 'multiple_choice' | 'true_false'
}

export interface GeneratedQuestion {
	statement: string
	options: { letter: string; text: string; isCorrect: boolean }[]
}

const generatedQuestionsSchema = z
	.array(
		z
			.object({
				statement: z.string().min(1),
				options: z
					.array(
						z.object({
							letter: z.string().min(1).max(1),
							text: z.string().min(1),
							isCorrect: z.boolean(),
						}),
					)
					.min(2),
			})
			.refine(
				(question) =>
					question.options.filter((option) => option.isCorrect).length === 1,
				'Exatamente uma alternativa correta é esperada',
			),
	)
	.min(1)

const responseSchema: Schema = {
	type: Type.ARRAY,
	items: {
		type: Type.OBJECT,
		properties: {
			statement: { type: Type.STRING },
			options: {
				type: Type.ARRAY,
				items: {
					type: Type.OBJECT,
					properties: {
						letter: { type: Type.STRING },
						text: { type: Type.STRING },
						isCorrect: { type: Type.BOOLEAN },
					},
					required: ['letter', 'text', 'isCorrect'],
				},
			},
		},
		required: ['statement', 'options'],
	},
}

function buildPrompt({
	subject,
	difficulty,
	questionCount,
	questionType,
}: GenerateQuestionsParams): string {
	const difficultyInstructions = `Nível de dificuldade: ${difficulty}/10 (0 = muito fácil, 10 = extremamente difícil). A dificuldade deve influenciar o vocabulário e a complexidade das questões.`

	const formatInstructions =
		questionType === 'multiple_choice'
			? 'Cada questão deve ter EXATAMENTE 4 alternativas, com as letras "A", "B", "C" e "D", sendo exatamente UMA marcada como correta (isCorrect: true).'
			: 'Cada questão deve ter EXATAMENTE 2 alternativas: letra "V" com texto "Verdadeiro" e letra "F" com texto "Falso", sendo exatamente UMA marcada como correta (isCorrect: true).'

	return `Você é um professor especialista em elaborar provas escolares.
Gere exatamente ${questionCount} questões de prova sobre o tema "${subject}", escritas em português do Brasil.
${difficultyInstructions}
${formatInstructions}
Cada enunciado deve ser original e autocontido: não faça referência a imagens, textos externos ou frases como "veja a imagem acima".
Responda apenas com o JSON estruturado solicitado, sem nenhum texto adicional.`
}

export async function generateExamQuestions(
	params: GenerateQuestionsParams,
): Promise<GeneratedQuestion[]> {
	if (!env.GEMINI_API_KEY) {
		throw new AiGenerationError(
			'Serviço de geração por IA não está configurado.',
		)
	}

	try {
		const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

		const response = await genAI.models.generateContent({
			model: env.GEMINI_MODEL,
			contents: buildPrompt(params),
			config: {
				responseMimeType: 'application/json',
				responseSchema,
			},
		})

		const text = response.text

		if (!text) {
			throw new AiGenerationError(
				'A IA não retornou nenhum conteúdo. Tente novamente.',
			)
		}

		const parsed = JSON.parse(text)

		return generatedQuestionsSchema.parse(parsed)
	} catch (error) {
		if (error instanceof AiGenerationError) {
			throw error
		}

		if (error instanceof SyntaxError) {
			console.error(
				'[gemini] Falha ao interpretar o JSON retornado pela IA:',
				error,
			)
			throw new AiGenerationError(
				'Não foi possível interpretar a resposta da IA. Tente novamente.',
			)
		}

		if (error instanceof z.ZodError) {
			console.error(
				'[gemini] Resposta da IA fora do formato esperado:',
				error.issues,
			)
			throw new AiGenerationError(
				'A resposta da IA não seguiu o formato esperado. Tente novamente.',
			)
		}

		console.error('[gemini] Falha inesperada ao chamar a API do Gemini:', error)
		throw new AiGenerationError()
	}
}
