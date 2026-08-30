import { AppError } from './app-error'

export class AdminSessionStaleError extends AppError {
	constructor(
		message = 'Sua sessão expirou para o painel administrativo. Faça login novamente.',
	) {
		super(message, 403, 'ADMIN_SESSION_STALE')
	}
}
