import { toast } from '@app/ui'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

export interface ApiErrorResponse {
	code?: string
	message?: string
	issues?:
		| Array<{
				path?: (string | number)[]
				message: string
		  }>
		| Record<string, { _errors?: string[] }>
}

export function applyApiErrorsToForm<TFieldValues extends FieldValues>(
	errorData: ApiErrorResponse,
	setError: UseFormSetError<TFieldValues>,
	defaultMessage = 'Ocorreu um erro ao processar a solicitação.',
) {
	if (Array.isArray(errorData.issues)) {
		for (const issue of errorData.issues) {
			const fieldName = issue.path?.[0] as Path<TFieldValues>
			if (fieldName) {
				setError(fieldName, {
					type: 'manual',
					message: issue.message,
				})
			}
		}
		toast.error(
			errorData.message || 'Verifique os campos destacados no formulário.',
		)
		return
	}

	if (
		errorData.code === 'CONFLICT' ||
		errorData.code === 'USER_ALREADY_EXISTS'
	) {
		setError('email' as Path<TFieldValues>, {
			type: 'manual',
			message: 'Este e-mail já está cadastrado no sistema.',
		})
		toast.error('Este e-mail já está cadastrado no sistema.')
		return
	}

	if (errorData.code === 'INVALID_TOKEN') {
		toast.error(
			'Este link expirou ou já foi utilizado. Solicite um novo link de recuperação.',
		)
		return
	}

	if (errorData.code === 'INVALID_CREDENTIALS') {
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

	toast.error(errorData.message || defaultMessage)
}
