import { z } from 'zod'

export const generateExamSchema = z.object({
	difficulty: z.number().int().min(0).max(10),
	questionCount: z.number().int().min(1).max(20),
	questionType: z.enum(['multiple_choice', 'true_false']),
})

export type GenerateExamInput = z.infer<typeof generateExamSchema>
