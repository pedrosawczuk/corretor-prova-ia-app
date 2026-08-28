import { AppError } from './app-error'

export class AiGenerationError extends AppError {
	constructor(
		message = 'Não foi possível gerar a prova com a IA. Tente novamente.',
	) {
		super(message, 502, 'AI_GENERATION_ERROR')
	}
}
