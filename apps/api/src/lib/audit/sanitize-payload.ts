const REDACTED = '[REDACTED]'

const SENSITIVE_KEYS = new Set([
	'password',
	'newpassword',
	'currentpassword',
	'confirmpassword',
	'token',
	'access_token',
	'refresh_token',
	'id_token',
	'otp',
	'code',
	'secret',
	'authorization',
	'cookie',
])

const MAX_DEPTH = 5

export function sanitizePayload(payload: unknown, depth = 0): unknown {
	if (payload === null || payload === undefined) return payload
	if (depth >= MAX_DEPTH) return '[TRUNCATED]'

	if (Buffer.isBuffer(payload)) return '[BINARY]'

	if (Array.isArray(payload)) {
		return payload.map((item) => sanitizePayload(item, depth + 1))
	}

	if (typeof payload !== 'object') return payload

	const result: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(payload)) {
		result[key] = SENSITIVE_KEYS.has(key.toLowerCase())
			? REDACTED
			: sanitizePayload(value, depth + 1)
	}
	return result
}

export function sanitizeHttpPath(url: string): string {
	const queryIndex = url.indexOf('?')
	if (queryIndex === -1) return url

	const pathname = url.slice(0, queryIndex)
	const search = url.slice(queryIndex + 1)
	if (!search) return pathname

	const params = new URLSearchParams(search)
	const sanitized = new URLSearchParams()

	for (const [key, value] of params.entries()) {
		sanitized.append(
			key,
			SENSITIVE_KEYS.has(key.toLowerCase()) ? REDACTED : value,
		)
	}

	const serialized = sanitized.toString()
	return serialized ? `${pathname}?${serialized}` : pathname
}
