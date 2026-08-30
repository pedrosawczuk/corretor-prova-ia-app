'use client'

import { toast } from '@app/ui'
import * as React from 'react'
import { ApiError, apiClient } from '@/lib/api-client'

interface UseGoogleAuthOptions {
	startErrorMessage: string
	successMessage: string
}

export function useGoogleAuth({
	startErrorMessage,
	successMessage,
}: UseGoogleAuthOptions) {
	const [isLoading, setIsLoading] = React.useState(false)

	async function signInWithGoogle() {
		setIsLoading(true)

		try {
			const data = await apiClient<{ url?: string }>('/auth/sign-in/social', {
				method: 'POST',
				body: JSON.stringify({
					provider: 'google',
					callbackURL: `${window.location.origin}/dashboard`,
				}),
			})

			if (data.url) {
				window.location.href = data.url
				return
			}

			toast.success(successMessage)
			window.location.href = '/dashboard'
		} catch (error) {
			toast.error(
				error instanceof ApiError
					? startErrorMessage
					: 'Erro ao comunicar com o servidor de autenticação.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	return { isLoading, signInWithGoogle }
}
