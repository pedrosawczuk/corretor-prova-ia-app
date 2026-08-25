import { app } from '@/app'

app
	.listen({
		port: 3333,
		host: '0.0.0.0',
	})
	.then(() => {
		console.log('HTTP running on 0.0.0.0:3333')
	})
