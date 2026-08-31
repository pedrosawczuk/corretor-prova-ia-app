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

export async function uploadAvatar(_userId: string, buffer: Buffer) {
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

export const MAX_SUBMISSION_PAGE_SIZE_BYTES = 10 * 1024 * 1024

const SUBMISSION_PAGES_PREFIX = 'submission-pages/'

const SUBMISSION_PAGE_URL_EXPIRY_SECONDS = 60 * 60

/**
 * Fotos de folhas de resposta contêm dados de alunos e ficam num prefixo
 * privado do bucket (sem policy pública) — o acesso de leitura é sempre via
 * URL assinada de curta duração, nunca uma URL pública permanente.
 */
export async function uploadSubmissionPage(buffer: Buffer, mimeType: string) {
	const objectName = `${SUBMISSION_PAGES_PREFIX}${randomUUID()}`

	await storageClient.putObject(
		env.MINIO_BUCKET,
		objectName,
		buffer,
		buffer.length,
		{
			'Content-Type': mimeType,
		},
	)

	return objectName
}

export async function downloadSubmissionPage(objectName: string) {
	const stream = await storageClient.getObject(env.MINIO_BUCKET, objectName)

	const chunks: Buffer[] = []
	for await (const chunk of stream) {
		chunks.push(chunk as Buffer)
	}

	return Buffer.concat(chunks)
}

export async function getSubmissionPageSignedUrl(objectName: string) {
	return storageClient.presignedGetObject(
		env.MINIO_BUCKET,
		objectName,
		SUBMISSION_PAGE_URL_EXPIRY_SECONDS,
	)
}

export async function deleteSubmissionPage(objectName: string) {
	await storageClient.removeObject(env.MINIO_BUCKET, objectName).catch(() => {})
}

const EXAM_TEMPLATES_PREFIX = 'exam-templates/'

/**
 * Cópia travada do PDF exatamente como foi impresso — referência para
 * reimpressão e para auditoria caso os marcadores de alternativa precisem
 * ser conferidos depois. Fica num prefixo privado (sem policy pública),
 * acesso só via URL assinada.
 */
export async function uploadExamTemplate(examId: string, buffer: Buffer) {
	const objectName = `${EXAM_TEMPLATES_PREFIX}${examId}.pdf`

	await storageClient.putObject(
		env.MINIO_BUCKET,
		objectName,
		buffer,
		buffer.length,
		{
			'Content-Type': 'application/pdf',
		},
	)

	return objectName
}
