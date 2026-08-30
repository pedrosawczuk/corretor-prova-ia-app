import { z } from 'zod'

export const listExamsQuerySchema = z.strictObject({
	classroomId: z.uuid('ID de turma inválido'),
})

export type ListExamsQuery = z.infer<typeof listExamsQuerySchema>
