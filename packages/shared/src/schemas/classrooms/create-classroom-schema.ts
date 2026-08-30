import { z } from 'zod'

export const createClassroomSchema = z.strictObject({
	name: z
		.string()
		.trim()
		.min(2, 'Informe o nome da turma')
		.max(100, 'O nome deve ter no máximo 100 caracteres'),
	subjectId: z.uuid('Selecione uma disciplina'),
	description: z
		.string()
		.trim()
		.max(500, 'A descrição deve ter no máximo 500 caracteres')
		.optional(),
})

export type CreateClassroomInput = z.infer<typeof createClassroomSchema>
