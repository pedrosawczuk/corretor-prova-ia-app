import type { IncomingHttpHeaders } from 'node:http'
import type { FastifyReply } from 'fastify'

export function toFetchHeaders(incoming: IncomingHttpHeaders): Headers {
	const headers = new Headers()

	for (const [key, value] of Object.entries(incoming)) {
		if (!value) continue

		if (Array.isArray(value)) {
			for (const v of value) {
				headers.append(key, v)
			}
		} else {
			headers.set(key, value)
		}
	}

	return headers
}

export function forwardWebResponse(webResponse: Response, reply: FastifyReply) {
	const setCookies = webResponse.headers.getSetCookie?.() ?? []
	if (setCookies.length > 0) {
		reply.header('set-cookie', setCookies)
	}

	for (const [key, value] of webResponse.headers.entries()) {
		if (key.toLowerCase() !== 'set-cookie') {
			reply.header(key, value)
		}
	}
}
