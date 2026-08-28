import { z } from 'zod'

export const listExamsQuerySchema = z.object({
	classroomId: z.uuid('ID de turma inválido'),
})

export type ListExamsQuery = z.infer<typeof listExamsQuerySchema>
