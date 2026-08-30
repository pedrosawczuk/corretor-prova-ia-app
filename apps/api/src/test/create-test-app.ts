import fastify from 'fastify'
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { registerErrorHandler } from '@/lib/http/register-error-handler'
import { adminRoutes } from '@/modules/admin/admin-routes'
import { classroomRoutes } from '@/modules/classrooms/classroom-routes'
import { examRoutes } from '@/modules/exams/exam-routes'
import { subjectRoutes } from '@/modules/subjects/subjects-routes'

export function createTestApp() {
	const app = fastify().withTypeProvider<ZodTypeProvider>()

	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)

	registerErrorHandler(app)

	app.register(classroomRoutes, { prefix: '/classrooms' })
	app.register(examRoutes, { prefix: '/exams' })
	app.register(subjectRoutes, { prefix: '/subjects' })
	app.register(adminRoutes, { prefix: '/admin' })

	return app
}
