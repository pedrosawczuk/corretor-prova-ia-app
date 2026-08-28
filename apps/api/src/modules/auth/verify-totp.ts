import type { VerifyTotpInput } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'

export async function verifyTotpModule(
	request: FastifyRequest<{ Body: VerifyTotpInput }>,
	reply: FastifyReply,
) {
	const { code, trustDevice } = request.body

	const response = await auth.api.verifyTOTP({
		body: { code, trustDevice },
		asResponse: true,
		headers: toFetchHeaders(request.headers),
	})

	forwardWebResponse(response, reply)

	const data = await response.json()
	return reply.status(response.status).send(data)
}
