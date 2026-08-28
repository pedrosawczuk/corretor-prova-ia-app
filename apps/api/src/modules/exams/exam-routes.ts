import { generateExamSchema } from '@app/shared'
import type { FastifyInstance } from 'fastify'
import { generateExamModule } from './generate-exam'
import { updateCorrectOptionModule } from './update-correct-option'
import {
	updateCorrectOptionBodySchema,
	updateCorrectOptionParamsSchema,
} from './update-correct-option-schema'

export function examRoutes(app: FastifyInstance) {
	app.post(
		'/generate',
		{
			schema: {
				body: generateExamSchema,
			},
		},
		generateExamModule,
	)

	app.patch(
		'/:examId/questions/:questionId/correct-option',
		{
			schema: {
				params: updateCorrectOptionParamsSchema,
				body: updateCorrectOptionBodySchema,
			},
		},
		updateCorrectOptionModule,
	)
}
