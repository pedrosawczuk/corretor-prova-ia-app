import { z } from 'zod'

export const getClassroomParamsSchema = z.strictObject({
	id: z.uuid('ID de turma inválido'),
})

export type GetClassroomParams = z.infer<typeof getClassroomParamsSchema>
