import fastify from 'fastify'
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { registerErrorHandler } from '@/lib/http/register-error-handler'
import { authRoutes } from '@/modules/auth/auth-routes'

export function createAuthTestApp() {
	const app = fastify().withTypeProvider<ZodTypeProvider>()

	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)

	registerErrorHandler(app)

	app.register(authRoutes, { prefix: '/auth' })

	return app
}
