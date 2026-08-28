import { toast } from '@app/ui'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './api-client'

const CONNECTION_ERROR_MESSAGE =
	'Não foi possível conectar ao servidor. Verifique sua conexão.'

export function toastApiError(error: unknown, fallback: string) {
	toast.error(
		error instanceof ApiError ? error.message || fallback : CONNECTION_ERROR_MESSAGE,
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
		toast.error(error.message || 'Verifique os campos destacados no formulário.')
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

	toast.error(error.message || defaultMessage)
}
