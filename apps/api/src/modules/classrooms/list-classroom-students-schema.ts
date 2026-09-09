import { z } from 'zod'

export const listClassroomStudentsParamsSchema = z.strictObject({
	classroomId: z.uuid('ID de turma inválido'),
})

export type ListClassroomStudentsParams = z.infer<
	typeof listClassroomStudentsParamsSchema
>
