import { randomUUID } from 'node:crypto'
import { env } from '@app/env'
import { Client } from 'minio'

export const storageClient = new Client({
	endPoint: env.MINIO_ENDPOINT,
	port: env.MINIO_PORT,
	useSSL: env.MINIO_USE_SSL,
	accessKey: env.MINIO_ACCESS_KEY,
	secretKey: env.MINIO_SECRET_KEY,
})

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

const AVATARS_PREFIX = 'avatars/'

export async function ensureAvatarsBucket() {
	const exists = await storageClient.bucketExists(env.MINIO_BUCKET)

	if (!exists) {
		await storageClient.makeBucket(env.MINIO_BUCKET)
	}

	await storageClient.setBucketPolicy(
		env.MINIO_BUCKET,
		JSON.stringify({
			Version: '2012-10-17',
			Statement: [
				{
					Effect: 'Allow',
					Principal: { AWS: ['*'] },
					Action: ['s3:GetObject'],
					Resource: [`arn:aws:s3:::${env.MINIO_BUCKET}/${AVATARS_PREFIX}*`],
				},
			],
		}),
	)
}

function getPublicBaseUrl() {
	const protocol = env.MINIO_USE_SSL ? 'https' : 'http'
	return `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET}/`
}

export async function uploadAvatar(userId: string, buffer: Buffer) {
	const objectName = `${AVATARS_PREFIX}${randomUUID()}.webp`

	await storageClient.putObject(
		env.MINIO_BUCKET,
		objectName,
		buffer,
		buffer.length,
		{ 'Content-Type': 'image/webp' },
	)

	return `${getPublicBaseUrl()}${objectName}`
}

export async function deleteObjectByPublicUrl(url: string) {
	const baseUrl = getPublicBaseUrl()
	if (!url.startsWith(baseUrl)) return

	const objectName = url.slice(baseUrl.length)
	await storageClient.removeObject(env.MINIO_BUCKET, objectName).catch(() => {})
}
