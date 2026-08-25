import { AppError } from './app-error'

export class InvalidCredentialsError extends AppError {
	constructor(message = 'Credenciais inválidas.') {
		super(message, 401, 'INVALID_CREDENTIALS')
	}
}
