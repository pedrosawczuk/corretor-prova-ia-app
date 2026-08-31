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

async function throwApiError(response: Response): Promise<never> {
	const errorData = await response.json().catch(() => ({}))
	throw new ApiError(
		errorData.message || 'Ocorreu um erro ao processar a solicitação.',
		errorData.code,
		errorData.issues,
	)
}

export async function apiClient<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const isFormData = init?.body instanceof FormData

	const response = await fetch(`${API_URL}${path}`, {
		...init,
		credentials: 'include',
		headers: {
			...(init?.body && !isFormData
				? { 'Content-Type': 'application/json' }
				: {}),
			...init?.headers,
		},
	})

	if (!response.ok) {
		return throwApiError(response)
	}

	if (response.status === 204) {
		return undefined as T
	}

	return response.json()
}

function filenameFromContentDisposition(
	contentDisposition: string | null,
	fallback: string,
): string {
	const match = contentDisposition?.match(/filename="([^"]+)"/)
	return match?.[1] || fallback
}

export async function downloadFile(
	path: string,
	fallbackFilename = 'download',
): Promise<void> {
	const response = await fetch(`${API_URL}${path}`, {
		credentials: 'include',
	})

	if (!response.ok) {
		return throwApiError(response)
	}

	const filename = filenameFromContentDisposition(
		response.headers.get('content-disposition'),
		fallbackFilename,
	)
	const blob = await response.blob()
	const url = URL.createObjectURL(blob)

	const link = document.createElement('a')
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	link.remove()
	URL.revokeObjectURL(url)
}
