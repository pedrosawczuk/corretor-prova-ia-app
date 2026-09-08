import { AppError } from './app-error'

export class PaymentRequiredError extends AppError {
	constructor(
		message = 'Você atingiu o limite de correções do seu plano. Assine ou compre um pacote de créditos para continuar.',
	) {
		super(message, 402, 'PAYMENT_REQUIRED')
	}
}
