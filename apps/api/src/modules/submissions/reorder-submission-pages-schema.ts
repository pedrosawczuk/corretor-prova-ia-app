import { z } from 'zod'

export const reorderSubmissionPagesBodySchema = z.strictObject({
	pageIds: z
		.array(z.uuid('ID de página inválido'))
		.min(1, 'Informe ao menos uma página.'),
})

export type ReorderSubmissionPagesBody = z.infer<
	typeof reorderSubmissionPagesBodySchema
>
