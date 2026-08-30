import { AppError } from './app-error'

export class AdminTwoFactorRequiredError extends AppError {
	constructor(
		message = 'Ative a verificação em duas etapas para acessar o painel administrativo.',
	) {
		super(message, 403, 'ADMIN_TWO_FACTOR_REQUIRED')
	}
}
