import { AppError } from './app-error'

export class ConflictError extends AppError {
	constructor(message = 'Conflito de recursos.') {
		super(message, 409, 'CONFLICT')
	}
}
