import { AppError } from './app-error'

export class BillingProviderError extends AppError {
	constructor(
		message = 'Não foi possível concluir a operação com o provedor de pagamento. Tente novamente.',
	) {
		super(message, 502, 'BILLING_PROVIDER_ERROR')
	}
}
