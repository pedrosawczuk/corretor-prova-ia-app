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
		include: ['src/**/*.test.ts'],
		setupFiles: ['./src/test/setup.ts'],
		fileParallelism: false,
		sequence: {
			concurrent: false,
		},
		server: {
			// O runtime WASM do OpenCV.js expõe um export CJS que confunde o
			// transform de SSR do Vite (thenable mal interpretado) — carregar
			// via require() nativo do Node evita o problema.
			deps: {
				external: [/@techstark\/opencv-js/],
			},
		},
	},
})
