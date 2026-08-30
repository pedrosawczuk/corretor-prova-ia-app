import { z } from 'zod'

export const generateExamSchema = z
	.strictObject({
		topic: z
			.string()
			.trim()
			.min(3, 'Informe o conteúdo da prova (mínimo 3 caracteres).')
			.max(500, 'O conteúdo da prova deve ter no máximo 500 caracteres.'),
		difficulty: z.number().int().min(0).max(10),
		questionCount: z.number().int().min(1).max(20),
		questionType: z.enum(['multiple_choice', 'true_false', 'mixed']),
		multipleChoiceCount: z.number().int().min(0).max(20).optional(),
	})
	.refine(
		(data) =>
			data.questionType !== 'mixed' || data.multipleChoiceCount !== undefined,
		{
			message: 'Informe quantas questões serão de múltipla escolha.',
			path: ['multipleChoiceCount'],
		},
	)
	.refine(
		(data) =>
			data.questionType !== 'mixed' ||
			(data.multipleChoiceCount as number) <= data.questionCount,
		{
			message:
				'A quantidade de múltipla escolha não pode ser maior que o total de questões.',
			path: ['multipleChoiceCount'],
		},
	)

export type GenerateExamInput = z.infer<typeof generateExamSchema>
