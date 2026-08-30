import { toast } from '@app/ui'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './api-client'

const CONNECTION_ERROR_MESSAGE =
	'Não foi possível conectar ao servidor. Verifique sua conexão.'

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
}

function resolveErrorMessage(error: ApiError, fallback: string) {
	if (error.code && error.code in KNOWN_ERROR_CODE_MESSAGES) {
		return KNOWN_ERROR_CODE_MESSAGES[error.code]
	}
	return error.message || fallback
}

export function toastApiError(error: unknown, fallback: string) {
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
			error.message || 'Verifique os campos destacados no formulário.',
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

	if (error.code === 'INVALID_CREDENTIALS') {
		setError('email' as Path<TFieldValues>, {
			type: 'manual',
			message: 'E-mail ou senha incorretos.',
		})
		setError('password' as Path<TFieldValues>, {
			type: 'manual',
			message: 'E-mail ou senha incorretos.',
		})
		toast.error('E-mail ou senha incorretos. Verifique suas credenciais.')
		return
	}

	toast.error(resolveErrorMessage(error, defaultMessage))
}
