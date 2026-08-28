import type { FastifyReply, FastifyRequest } from 'fastify'
import sharp from 'sharp'
import { BadRequestError, UnauthorizedError } from '@/core/errors'
import { auth } from '@/lib/auth'
import { forwardWebResponse, toFetchHeaders } from '@/lib/http-utils'
import { deleteObjectByPublicUrl, uploadAvatar } from '@/lib/storage'

const AVATAR_DIMENSION = 512

export async function uploadAvatarModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const headers = toFetchHeaders(request.headers)

	const session = await auth.api.getSession({ headers })
	if (!session) throw new UnauthorizedError()

	const file = await request.file().catch((error) => {
		if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
			throw new BadRequestError('A imagem deve ter no máximo 5MB.')
		}
		throw error
	})

	if (!file) throw new BadRequestError('Nenhum arquivo enviado.')
	if (!file.mimetype.startsWith('image/')) {
		throw new BadRequestError('O arquivo enviado precisa ser uma imagem.')
	}

	const originalBuffer = await file.toBuffer().catch((error) => {
		if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
			throw new BadRequestError('A imagem deve ter no máximo 5MB.')
		}
		throw error
	})

	const webpBuffer = await sharp(originalBuffer)
		.resize(AVATAR_DIMENSION, AVATAR_DIMENSION, { fit: 'cover' })
		.webp({ quality: 80 })
		.toBuffer()

	const previousImage = session.user.image
	const imageUrl = await uploadAvatar(session.user.id, webpBuffer)

	const response = await auth.api.updateUser({
		body: { image: imageUrl },
		asResponse: true,
		headers,
	})

	forwardWebResponse(response, reply)

	if (previousImage) {
		await deleteObjectByPublicUrl(previousImage)
	}

	const data = await response.json()
	return reply.status(response.status).send(data)
}
