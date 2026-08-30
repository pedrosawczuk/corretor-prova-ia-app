import type { FastifyInstance } from 'fastify'
import { listSubjectsModule } from './list-subjects'

export function subjectRoutes(app: FastifyInstance) {
	app.get('/', listSubjectsModule)
}
