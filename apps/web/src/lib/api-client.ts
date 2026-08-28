export interface ApiErrorIssue {
	path?: (string | number)[]
	message: string
}

export class ApiError extends Error {
	code?: string
	issues?: ApiErrorIssue[] | Record<string, { _errors?: string[] }>

	constructor(
		message: string,
		code?: string,
		issues?: ApiErrorIssue[] | Record<string, { _errors?: string[] }>,
	) {
		super(message)
		this.name = 'ApiError'
		this.code = code
		this.issues = issues
	}
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export async function apiClient<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		...init,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...init?.headers,
		},
	})

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}))
		throw new ApiError(
			errorData.message || 'Ocorreu um erro ao processar a solicitação.',
			errorData.code,
			errorData.issues,
		)
	}

	if (response.status === 204) {
		return undefined as T
	}

	return response.json()
}
