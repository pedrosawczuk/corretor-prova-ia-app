import { z } from 'zod'

export const getAdminSubjectParamsSchema = z.strictObject({
	id: z.uuid('ID de disciplina inválido'),
})

export type GetAdminSubjectParams = z.infer<typeof getAdminSubjectParamsSchema>
