import { env } from '@app/env'
import type { VerifyEmailQuery } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { BadRequestError } from '@/core/errors'
import { auth } from '@/lib/auth/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/auth/http-utils'

function assertAllowedCallbackUrl(callbackURL: string) {
	let parsed: URL
	try {
		parsed = new URL(callbackURL)
	} catch {
		throw new BadRequestError('URL de retorno inválida.')
	}

	const allowedOrigins = new Set([
		new URL(env.WEB_URL).origin,
		new URL(env.BETTER_AUTH_URL).origin,
		...(env.NODE_ENV !== 'prod' ? ['http://localhost:3000'] : []),
	])

	if (!allowedOrigins.has(parsed.origin)) {
		throw new BadRequestError('Domínio da URL de callback inválido.')
	}
}

export async function verifyEmailModule(
	request: FastifyRequest<{ Querystring: VerifyEmailQuery }>,
	reply: FastifyReply,
) {
	const { token, callbackURL } = request.query

	if (callbackURL) {
		assertAllowedCallbackUrl(callbackURL)
	}

	const response = await auth.api.verifyEmail({
		query: { token, callbackURL },
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	if (response.status >= 300 && response.status < 400) {
		return reply.status(response.status).send()
	}

	const data = await response.json()
	return reply.status(response.status).send(data)
}
