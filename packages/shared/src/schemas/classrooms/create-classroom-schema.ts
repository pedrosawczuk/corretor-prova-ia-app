import { z } from 'zod'

export const createClassroomSchema = z.object({
	name: z.string().trim().min(2, 'Informe o nome da turma'),
	subject: z.string().trim().min(2, 'Informe a disciplina'),
	description: z
		.string()
		.trim()
		.max(500, 'A descrição deve ter no máximo 500 caracteres')
		.optional(),
})

export type CreateClassroomInput = z.infer<typeof createClassroomSchema>
