import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	test: {
		environment: 'node',
		fileParallelism: false,
		sequence: {
			concurrent: false,
		},
		server: {
			deps: {
				external: [/@techstark\/opencv-js/],
			},
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['src/**/*.test.ts'],
					setupFiles: ['./src/test/setup.ts'],
				},
			},
			{
				extends: true,
				test: {
					name: 'integration',
					include: ['src/**/*.spec.ts'],
					setupFiles: ['./src/test/integration-setup.ts'],
					globalSetup: ['./src/test/integration-global-setup.ts'],
					env: {
						NODE_ENV: 'test',
					},
				},
			},
		],
	},
})
