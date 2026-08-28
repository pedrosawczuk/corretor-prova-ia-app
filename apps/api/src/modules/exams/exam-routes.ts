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
	updateQuestionParamsSchema,
	updateQuestionBodySchema,
	regenerateQuestionParamsSchema,
	regenerateQuestionBodySchema,
} from '@app/shared'
import {
	updateCorrectOptionBodySchema,
	updateCorrectOptionParamsSchema,
} from './update-correct-option-schema'
import { updateQuestionModule } from './update-question'
import { regenerateQuestionModule } from './regenerate-question'
import { deleteQuestionModule } from './delete-question'

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
			config: {
				rateLimit: {
					max: 3,
					timeWindow: '1 minute',
				},
			},
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

	app.patch(
		'/:examId/questions/:questionId',
		{
			schema: {
				params: updateQuestionParamsSchema,
				body: updateQuestionBodySchema,
			},
		},
		updateQuestionModule,
	)

	app.post(
		'/:examId/questions/:questionId/regenerate',
		{
			config: {
				rateLimit: {
					max: 10,
					timeWindow: '1 minute',
				},
			},
			schema: {
				params: regenerateQuestionParamsSchema,
				body: regenerateQuestionBodySchema,
			},
		},
		regenerateQuestionModule,
	)

	app.delete(
		'/:examId/questions/:questionId',
		{
			schema: {
				params: updateQuestionParamsSchema,
			},
		},
		deleteQuestionModule,
	)
}
