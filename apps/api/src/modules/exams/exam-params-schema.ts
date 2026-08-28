import { z } from 'zod'

export const examParamsSchema = z.object({
	examId: z.uuid('ID de prova inválido'),
})

export type ExamParams = z.infer<typeof examParamsSchema>
