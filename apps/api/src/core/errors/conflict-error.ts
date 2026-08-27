import { AppError } from './app-error'

export class ConflictError extends AppError {
	constructor(message = 'Email already registered.') {
		super(message, 409, 'CONFLICT')
	}
}
