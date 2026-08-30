import { z } from 'zod'

export const regenerateQuestionParamsSchema = z.strictObject({
	examId: z.string().uuid(),
	questionId: z.string().uuid(),
})

export const regenerateQuestionBodySchema = z.strictObject({
	difficulty: z.number().int().min(0).max(10).optional().default(5),
})

export type RegenerateQuestionParams = z.infer<
	typeof regenerateQuestionParamsSchema
>
export type RegenerateQuestionBody = z.infer<
	typeof regenerateQuestionBodySchema
>
