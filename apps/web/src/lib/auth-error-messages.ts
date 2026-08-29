export interface AuthErrorInfo {
	title: string
	description: string
	action: 'resend-verification' | 'retry'
}

const AUTH_ERROR_MESSAGES: Record<string, AuthErrorInfo> = {
	account_not_linked: {
		title: 'E-mail ainda não confirmado',
		description:
			'Já existe uma conta com este e-mail, mas ela ainda não foi confirmada. Confirme seu e-mail para poder entrar com o Google.',
		action: 'resend-verification',
	},
	email_not_verified: {
		title: 'E-mail não confirmado',
		description:
			'Confirme seu e-mail para ativar sua conta antes de continuar.',
		action: 'resend-verification',
	},
	email_does_not_match: {
		title: 'E-mail não corresponde',
		description:
			'O e-mail retornado pelo provedor de login é diferente do e-mail da sua conta.',
		action: 'retry',
	},
	account_already_linked_to_different_user: {
		title: 'Conta já vinculada',
		description:
			'Esta conta Google já está vinculada a outro usuário do Gabarita.app.',
		action: 'retry',
	},
	unable_to_link_account: {
		title: 'Não foi possível vincular a conta',
		description:
			'Não conseguimos vincular sua conta Google. Tente novamente em instantes.',
		action: 'retry',
	},
	unable_to_get_user_info: {
		title: 'Falha ao obter dados do Google',
		description:
			'Não conseguimos obter suas informações a partir da conta Google. Tente novamente.',
		action: 'retry',
	},
	email_not_found: {
		title: 'E-mail não encontrado',
		description:
			'Sua conta Google não retornou um e-mail. Verifique as permissões concedidas e tente novamente.',
		action: 'retry',
	},
	signup_disabled: {
		title: 'Cadastro indisponível',
		description: 'Novos cadastros estão temporariamente desabilitados.',
		action: 'retry',
	},
}

const DEFAULT_ERROR: AuthErrorInfo = {
	title: 'Não foi possível entrar',
	description:
		'Ocorreu um erro inesperado durante a autenticação. Tente novamente ou volte para o login.',
	action: 'retry',
}

export function getAuthErrorInfo(code?: string): AuthErrorInfo {
	if (!code) return DEFAULT_ERROR
	return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_ERROR
}
