import { z } from 'zod'

export const createClassroomSchema = z.strictObject({
	name: z
		.string()
		.trim()
		.min(2, 'Informe o nome da turma')
		.max(100, 'O nome deve ter no máximo 100 caracteres'),
	subject: z
		.string()
		.trim()
		.min(2, 'Informe a disciplina')
		.max(100, 'A disciplina deve ter no máximo 100 caracteres'),
	description: z
		.string()
		.trim()
		.max(500, 'A descrição deve ter no máximo 500 caracteres')
		.optional(),
})

export type CreateClassroomInput = z.infer<typeof createClassroomSchema>
