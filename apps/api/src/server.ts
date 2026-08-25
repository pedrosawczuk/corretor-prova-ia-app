import { env } from '@app/env'
import { app } from '@/app'

app
	.listen({
		port: env.PORT,
		host: env.HOST,
	})
	.then(() => {
		console.log(`HTTP server running on http://${env.HOST}:${env.PORT}`)
	})
