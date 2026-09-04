import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyAbacatePayWebhookSignature } from './verify-webhook-signature'

const secret = 'test-webhook-secret'
const rawBody = JSON.stringify({
	id: 'evt_123',
	event: 'checkout.completed',
	data: { id: 'bill_abc' },
})

function sign(body: string, withSecret: string) {
	return createHmac('sha256', withSecret).update(Buffer.from(body, 'utf8')).digest('base64')
}

describe('verifyAbacatePayWebhookSignature', () => {
	it('retorna true quando a assinatura corresponde ao corpo e ao segredo', () => {
		const signature = sign(rawBody, secret)

		expect(
			verifyAbacatePayWebhookSignature(rawBody, signature, secret),
		).toBe(true)
	})

	it('retorna false quando a assinatura foi gerada com um segredo diferente', () => {
		const signature = sign(rawBody, 'outro-segredo')

		expect(
			verifyAbacatePayWebhookSignature(rawBody, signature, secret),
		).toBe(false)
	})

	it('retorna false quando o corpo foi alterado após a assinatura ser gerada', () => {
		const signature = sign(rawBody, secret)
		const tamperedBody = JSON.stringify({
			id: 'evt_123',
			event: 'checkout.completed',
			data: { id: 'bill_outro' },
		})

		expect(
			verifyAbacatePayWebhookSignature(tamperedBody, signature, secret),
		).toBe(false)
	})

	it('retorna false quando o header de assinatura está ausente', () => {
		expect(
			verifyAbacatePayWebhookSignature(rawBody, undefined, secret),
		).toBe(false)
	})

	it('retorna false quando o header de assinatura está vazio', () => {
		expect(verifyAbacatePayWebhookSignature(rawBody, '', secret)).toBe(false)
	})

	it('retorna false quando a assinatura tem tamanho diferente do esperado', () => {
		expect(
			verifyAbacatePayWebhookSignature(rawBody, 'assinatura-curta', secret),
		).toBe(false)
	})
})
