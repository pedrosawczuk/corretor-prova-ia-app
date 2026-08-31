import {
	createExamSchema,
	generateExamSchema,
	regenerateQuestionBodySchema,
	regenerateQuestionParamsSchema,
	updateQuestionBodySchema,
	updateQuestionParamsSchema,
} from '@app/shared'
import type { FastifyInstance } from 'fastify'
import { createExamModule } from './create-exam'
import { deleteQuestionModule } from './delete-question'
import { examParamsSchema } from './exam-params-schema'
import { exportExamDocxModule } from './export-exam-docx'
import { exportExamPdfModule } from './export-exam-pdf'
import { generateExamModule } from './generate-exam'
import { getExamModule } from './get-exam'
import { listExamsModule } from './list-exams'
import { listExamsQuerySchema } from './list-exams-schema'
import { regenerateQuestionModule } from './regenerate-question'
import { updateCorrectOptionModule } from './update-correct-option'
import {
	updateCorrectOptionBodySchema,
	updateCorrectOptionParamsSchema,
} from './update-correct-option-schema'
import { updateQuestionModule } from './update-question'

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

	app.get(
		'/:examId/export/pdf',
		{
			schema: {
				params: examParamsSchema,
			},
		},
		exportExamPdfModule,
	)

	app.get(
		'/:examId/export/docx',
		{
			schema: {
				params: examParamsSchema,
			},
		},
		exportExamDocxModule,
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
