import { createRequire } from 'node:module'
import type cvNamespace from '@techstark/opencv-js'

type CvModule = typeof cvNamespace

/**
 * O runtime do OpenCV.js é WASM e leva um instante pra inicializar — carregamos
 * e reutilizamos uma única instância por processo em vez de reinicializar a
 * cada submissão processada. Carregado via require() do Node (em vez de
 * import estático/dinâmico) porque o export CJS/Promise deste pacote confunde
 * o transform de módulos do runtime de testes.
 */
let cvPromise: Promise<CvModule> | undefined

export function getOpenCv(): Promise<CvModule> {
	if (!cvPromise) {
		const require = createRequire(import.meta.url)
		const cvModule = require('@techstark/opencv-js') as CvModule & {
			Mat?: unknown
			onRuntimeInitialized?: () => void
		}

		cvPromise =
			cvModule instanceof Promise
				? cvModule
				: cvModule.Mat
					? Promise.resolve(cvModule)
					: new Promise<CvModule>((resolve) => {
							cvModule.onRuntimeInitialized = () => resolve(cvModule)
						})
	}

	return cvPromise
}
