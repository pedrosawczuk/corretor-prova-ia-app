import { AppError } from './app-error'

export class TooManyRequestsError extends AppError {
	constructor(
		message = 'Muitas requisições. Tente novamente em alguns instantes.',
	) {
		super(message, 429, 'RATE_LIMIT_EXCEEDED')
	}
}
