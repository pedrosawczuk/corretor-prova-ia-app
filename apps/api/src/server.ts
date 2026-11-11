import { env } from '@app/env'
import { app } from '@/app'
import { startScheduledJobs } from '@/lib/jobs/start-scheduled-jobs'

app
	.listen({
		port: env.PORT,
		host: env.HOST,
	})
	.then(() => {
		console.log(`HTTP server running on http://${env.HOST}:${env.PORT}`)
		startScheduledJobs()
	})
