import type { FastifyInstance } from 'fastify'
import { createSubmissionModule } from './create-submission'
import { createSubmissionBodySchema } from './create-submission-schema'
import { getSubmissionModule } from './get-submission'
import { listSubmissionsModule } from './list-submissions'
import { processSubmissionModule } from './process-submission'
import { reviewSubmissionAnswerModule } from './review-submission-answer'
import { reviewSubmissionAnswerBodySchema } from './review-submission-answer-schema'
import {
	examSubmissionsParamsSchema,
	submissionAnswerParamsSchema,
	submissionParamsSchema,
} from './submission-params-schema'
import { uploadSubmissionPageModule } from './upload-submission-page'

export function submissionRoutes(app: FastifyInstance) {
	app.post(
		'/exams/:examId/submissions',
		{
			schema: {
				params: examSubmissionsParamsSchema,
				body: createSubmissionBodySchema,
			},
		},
		createSubmissionModule,
	)

	app.get(
		'/exams/:examId/submissions',
		{ schema: { params: examSubmissionsParamsSchema } },
		listSubmissionsModule,
	)

	app.get(
		'/submissions/:submissionId',
		{ schema: { params: submissionParamsSchema } },
		getSubmissionModule,
	)

	app.post(
		'/submissions/:submissionId/pages',
		{ schema: { params: submissionParamsSchema } },
		uploadSubmissionPageModule,
	)

	app.post(
		'/submissions/:submissionId/process',
		{
			config: {
				rateLimit: {
					max: 5,
					timeWindow: '1 minute',
				},
			},
			schema: { params: submissionParamsSchema },
		},
		processSubmissionModule,
	)

	app.patch(
		'/submissions/:submissionId/answers/:answerId',
		{
			schema: {
				params: submissionAnswerParamsSchema,
				body: reviewSubmissionAnswerBodySchema,
			},
		},
		reviewSubmissionAnswerModule,
	)
}
