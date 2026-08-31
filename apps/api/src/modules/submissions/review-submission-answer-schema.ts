import { z } from 'zod'

export const reviewSubmissionAnswerBodySchema = z.strictObject({
	optionId: z.uuid('ID de alternativa inválido').nullable(),
})

export type ReviewSubmissionAnswerBody = z.infer<
	typeof reviewSubmissionAnswerBodySchema
>
