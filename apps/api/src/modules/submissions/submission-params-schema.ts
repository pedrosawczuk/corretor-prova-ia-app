import { z } from 'zod'

export const examSubmissionsParamsSchema = z.strictObject({
	examId: z.uuid('ID de prova inválido'),
})

export type ExamSubmissionsParams = z.infer<typeof examSubmissionsParamsSchema>

export const submissionParamsSchema = z.strictObject({
	submissionId: z.uuid('ID de submissão inválido'),
})

export type SubmissionParams = z.infer<typeof submissionParamsSchema>

export const submissionAnswerParamsSchema = z.strictObject({
	submissionId: z.uuid('ID de submissão inválido'),
	answerId: z.uuid('ID de resposta inválido'),
})

export type SubmissionAnswerParams = z.infer<
	typeof submissionAnswerParamsSchema
>
