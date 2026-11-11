import { z } from 'zod'

export const resourceIdParamsSchema = z.strictObject({
	id: z.uuid('ID inválido'),
})

export type ResourceIdParams = z.infer<typeof resourceIdParamsSchema>
