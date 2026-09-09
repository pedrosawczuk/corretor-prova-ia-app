import { createClassroomSchema } from '@app/shared'
import type { FastifyInstance } from 'fastify'
import { createClassroomModule } from './create-classroom'
import { deleteClassroomModule } from './delete-classroom'
import { getClassroomModule } from './get-classroom'
import { getClassroomParamsSchema } from './get-classroom-schema'
import { listClassroomStudentsModule } from './list-classroom-students'
import { listClassroomStudentsParamsSchema } from './list-classroom-students-schema'
import { listClassroomsModule } from './list-classrooms'
import { updateClassroomModule } from './update-classroom'

export function classroomRoutes(app: FastifyInstance) {
	app.post(
		'/',
		{
			schema: {
				body: createClassroomSchema,
			},
		},
		createClassroomModule,
	)

	app.get('/', listClassroomsModule)

	app.get(
		'/:classroomId/students',
		{
			schema: {
				params: listClassroomStudentsParamsSchema,
			},
		},
		listClassroomStudentsModule,
	)

	app.get(
		'/:id',
		{
			schema: {
				params: getClassroomParamsSchema,
			},
		},
		getClassroomModule,
	)

	app.patch(
		'/:id',
		{
			schema: {
				params: getClassroomParamsSchema,
				body: createClassroomSchema,
			},
		},
		updateClassroomModule,
	)

	app.delete(
		'/:id',
		{
			schema: {
				params: getClassroomParamsSchema,
			},
		},
		deleteClassroomModule,
	)
}
