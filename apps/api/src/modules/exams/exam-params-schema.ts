import { z } from 'zod'

export const examParamsSchema = z.strictObject({
	examId: z.uuid('ID de prova inválido'),
})

export type ExamParams = z.infer<typeof examParamsSchema>
