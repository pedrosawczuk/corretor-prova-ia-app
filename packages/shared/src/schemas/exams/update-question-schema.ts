import { z } from 'zod'

export const updateQuestionParamsSchema = z.strictObject({
	examId: z.string().uuid(),
	questionId: z.string().uuid(),
})

export const updateQuestionBodySchema = z.strictObject({
	statement: z
		.string()
		.trim()
		.min(1, 'O enunciado não pode ser vazio.')
		.max(2000, 'O enunciado deve ter no máximo 2000 caracteres.'),
	options: z
		.array(
			z.strictObject({
				id: z.string().uuid(),
				text: z
					.string()
					.trim()
					.min(1, 'O texto da alternativa não pode ser vazio.')
					.max(500, 'O texto da alternativa deve ter no máximo 500 caracteres.'),
			}),
		)
		.min(2, 'A questão deve ter pelo menos 2 alternativas.')
		.max(10, 'A questão pode ter no máximo 10 alternativas.'),
})

export type UpdateQuestionParams = z.infer<typeof updateQuestionParamsSchema>
export type UpdateQuestionBody = z.infer<typeof updateQuestionBodySchema>
