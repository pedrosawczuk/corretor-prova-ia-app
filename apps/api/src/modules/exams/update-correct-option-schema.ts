import { z } from 'zod'

export const updateCorrectOptionParamsSchema = z.object({
	examId: z.uuid('ID de prova inválido'),
	questionId: z.uuid('ID de questão inválido'),
})

export const updateCorrectOptionBodySchema = z.object({
	optionId: z.uuid('ID de alternativa inválido'),
})

export type UpdateCorrectOptionParams = z.infer<
	typeof updateCorrectOptionParamsSchema
>
export type UpdateCorrectOptionBody = z.infer<
	typeof updateCorrectOptionBodySchema
>
