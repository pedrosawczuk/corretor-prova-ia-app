import { z } from 'zod'

export const updateQuestionParamsSchema = z.object({
	examId: z.string().uuid(),
	questionId: z.string().uuid(),
})

export const updateQuestionBodySchema = z.object({
	statement: z.string().min(1, 'O enunciado não pode ser vazio.'),
	options: z
		.array(
			z.object({
				id: z.string().uuid(),
				text: z.string().min(1, 'O texto da alternativa não pode ser vazio.'),
			}),
		)
		.min(2, 'A questão deve ter pelo menos 2 alternativas.'),
})

export type UpdateQuestionParams = z.infer<typeof updateQuestionParamsSchema>
export type UpdateQuestionBody = z.infer<typeof updateQuestionBodySchema>
