import { createExamSchema, generateExamSchema } from '@app/shared'
import type { FastifyInstance } from 'fastify'
import { createExamModule } from './create-exam'
import { examParamsSchema } from './exam-params-schema'
import { generateExamModule } from './generate-exam'
import { getExamModule } from './get-exam'
import { listExamsModule } from './list-exams'
import { listExamsQuerySchema } from './list-exams-schema'
import { updateCorrectOptionModule } from './update-correct-option'
import {
	updateCorrectOptionBodySchema,
	updateCorrectOptionParamsSchema,
} from './update-correct-option-schema'

export function examRoutes(app: FastifyInstance) {
	app.post(
		'/',
		{
			schema: {
				body: createExamSchema,
			},
		},
		createExamModule,
	)

	app.get(
		'/',
		{
			schema: {
				querystring: listExamsQuerySchema,
			},
		},
		listExamsModule,
	)

	app.get(
		'/:examId',
		{
			schema: {
				params: examParamsSchema,
			},
		},
		getExamModule,
	)

	app.post(
		'/:examId/generate',
		{
			schema: {
				params: examParamsSchema,
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
