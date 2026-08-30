const REDACTED = '[REDACTED]'

const SENSITIVE_KEYS = new Set([
	'password',
	'newpassword',
	'currentpassword',
	'confirmpassword',
	'token',
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
