import { timingSafeEqual } from 'node:crypto'

export function verifyAsaasWebhookToken(
	received: string | undefined,
	expected: string,
): boolean {
	if (!received) return false

	const expectedBuffer = Buffer.from(expected)
	const receivedBuffer = Buffer.from(received)

	if (expectedBuffer.length !== receivedBuffer.length) return false

	return timingSafeEqual(expectedBuffer, receivedBuffer)
}
