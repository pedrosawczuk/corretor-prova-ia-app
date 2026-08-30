import { z } from 'zod'

export const createSubjectSchema = z.strictObject({
	name: z
		.string()
		.trim()
		.min(2, 'Informe o nome da disciplina')
		.max(100, 'O nome deve ter no máximo 100 caracteres'),
})

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
