import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyAbacatePayWebhookSignature(
	rawBody: string,
	signatureHeader: string | undefined,
	secret: string,
): boolean {
	if (!signatureHeader) return false

	const expected = createHmac('sha256', secret)
		.update(Buffer.from(rawBody, 'utf8'))
		.digest('base64')

	const expectedBuffer = Buffer.from(expected)
	const receivedBuffer = Buffer.from(signatureHeader)

	if (expectedBuffer.length !== receivedBuffer.length) return false

	return timingSafeEqual(expectedBuffer, receivedBuffer)
}
