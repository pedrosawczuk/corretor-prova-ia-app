import { toast } from '@app/ui'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './api-client'

const CONNECTION_ERROR_MESSAGE =
	'Sem conexão com o servidor. Verifique sua internet e tente novamente.'

const SERVER_ERROR_MESSAGE =
	'Algo deu errado no servidor no momento. Tente novamente em alguns instantes.'

const RAW_TECHNICAL_MESSAGE_RE =
	/^(internal server error|bad gateway|service unavailable|gateway timeout|unexpected token|failed to fetch|networkerror|request failed|error:?\s*\d{3}|something went wrong)/i

const KNOWN_ERROR_CODE_MESSAGES: Record<string, string> = {
	INVALID_PASSWORD: 'Senha atual incorreta.',
	INVALID_CODE: 'Código inválido. Tente novamente.',
	INVALID_BACKUP_CODE: 'Código de backup inválido.',
	INVALID_TWO_FACTOR_COOKIE:
		'Sessão de verificação expirada. Faça login novamente.',
	TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE:
		'Muitas tentativas. Solicite um novo código.',
	ACCOUNT_TEMPORARILY_LOCKED:
		'Muitas tentativas incorretas. Sua conta foi bloqueada temporariamente. Tente novamente mais tarde.',
	SESSION_NOT_FRESH: 'Por segurança, faça login novamente para continuar.',
	INVALID_TOKEN: 'Este link expirou ou já foi utilizado.',
	EMAIL_NOT_VERIFIED:
		'Você precisa confirmar seu e-mail antes de continuar. Verifique sua caixa de entrada.',
	USER_ALREADY_EXISTS: 'Este e-mail já está cadastrado no sistema.',
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
		'Este e-mail já está cadastrado no sistema.',
	INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
	INVALID_EMAIL_OR_PASSWORD: 'E-mail ou senha incorretos.',
	INVALID_EMAIL: 'Digite um e-mail válido.',
	USER_NOT_FOUND: 'Nenhuma conta encontrada com este e-mail.',
	PASSWORD_TOO_SHORT: 'A senha está muito curta.',
	PASSWORD_TOO_LONG: 'A senha ultrapassou o limite de caracteres.',
	TOO_MANY_REQUESTS:
		'Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.',
	RATE_LIMIT_EXCEEDED:
		'Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.',
	UNAUTHORIZED: 'Sua sessão expirou. Entre novamente para continuar.',
	FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
	INTERNAL_SERVER_ERROR: SERVER_ERROR_MESSAGE,
	SERVICE_UNAVAILABLE: SERVER_ERROR_MESSAGE,
	BAD_GATEWAY: SERVER_ERROR_MESSAGE,
	GATEWAY_TIMEOUT: SERVER_ERROR_MESSAGE,
}

function resolveErrorMessage(error: ApiError, fallback: string) {
	const code = error.code?.toUpperCase()
	if (code && code in KNOWN_ERROR_CODE_MESSAGES) {
		return KNOWN_ERROR_CODE_MESSAGES[code]
	}

	if (error.status && error.status >= 500) {
		return SERVER_ERROR_MESSAGE
	}
	if (error.status === 429) {
		return KNOWN_ERROR_CODE_MESSAGES.TOO_MANY_REQUESTS
	}
	if (error.status === 401) {
		return KNOWN_ERROR_CODE_MESSAGES.UNAUTHORIZED
	}
	if (error.status === 403) {
		return KNOWN_ERROR_CODE_MESSAGES.FORBIDDEN
	}

	if (!error.message || RAW_TECHNICAL_MESSAGE_RE.test(error.message.trim())) {
		return fallback
	}

	return error.message
}

export function toastApiError(error: unknown, fallback: string) {
	if (error instanceof ApiError && error.code === 'PAYMENT_REQUIRED') {
		toast.error(error.message || fallback, {
			action: {
				label: 'Ver planos',
				onClick: () => {
					window.location.href = '/dashboard/configuracoes'
				},
			},
		})
		return
	}

	toast.error(
		error instanceof ApiError
			? resolveErrorMessage(error, fallback)
			: CONNECTION_ERROR_MESSAGE,
	)
}

export function applyApiErrorsToForm<TFieldValues extends FieldValues>(
	error: unknown,
	setError: UseFormSetError<TFieldValues>,
	defaultMessage = 'Ocorreu um erro ao processar a solicitação.',
) {
	if (!(error instanceof ApiError)) {
		toast.error(CONNECTION_ERROR_MESSAGE)
		return
	}

	if (Array.isArray(error.issues)) {
		for (const issue of error.issues) {
			const fieldName = issue.path?.[0] as Path<TFieldValues>
			if (fieldName) {
				setError(fieldName, {
					type: 'manual',
					message: issue.message,
				})
			}
		}
		toast.error(
			resolveErrorMessage(
				error,
				'Verifique os campos destacados no formulário.',
			),
		)
		return
	}

	if (error.code === 'CONFLICT' || error.code === 'USER_ALREADY_EXISTS') {
		setError('email' as Path<TFieldValues>, {
			type: 'manual',
			message: 'Este e-mail já está cadastrado no sistema.',
		})
		toast.error('Este e-mail já está cadastrado no sistema.')
		return
	}

	if (error.code === 'INVALID_TOKEN') {
		toast.error(
			'Este link expirou ou já foi utilizado. Solicite um novo link de recuperação.',
		)
		return
	}

	if (error.code === 'EMAIL_NOT_VERIFIED') {
		toast.error(
			'Você precisa confirmar seu e-mail antes de entrar. Verifique sua caixa de entrada.',
		)
		return
	}

	if (
		error.code === 'INVALID_CREDENTIALS' ||
		error.code === 'INVALID_EMAIL_OR_PASSWORD'
	) {
		setError('email' as Path<TFieldValues>, {
			type: 'manual',
			message: 'E-mail ou senha incorretos.',
		})
		setError('password' as Path<TFieldValues>, {
			type: 'manual',
			message: 'E-mail ou senha incorretos.',
		})
		toast.error(
			'E-mail ou senha incorretos. Confira seus dados e tente novamente.',
		)
		return
	}

	toast.error(resolveErrorMessage(error, defaultMessage))
}
