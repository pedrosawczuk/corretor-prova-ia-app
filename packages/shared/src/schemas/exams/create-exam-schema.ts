import { z } from 'zod'

export const createExamSchema = z.object({
	classroomId: z.uuid('Selecione uma turma'),
	title: z.string().trim().min(2, 'Informe o nome da prova'),
	description: z
		.string()
		.trim()
		.max(500, 'A descrição deve ter no máximo 500 caracteres')
		.optional(),
})

export type CreateExamInput = z.infer<typeof createExamSchema>
