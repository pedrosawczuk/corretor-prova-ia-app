import { z } from 'zod'

export const createSubmissionBodySchema = z.strictObject({
	studentIdentifier: z.string().trim().min(1).max(255).optional(),
})

export type CreateSubmissionBody = z.infer<typeof createSubmissionBodySchema>
