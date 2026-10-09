import { describe, expect, it } from 'vitest'
import { verifyAsaasWebhookToken } from './verify-asaas-webhook-token'

const expected = 'token-de-teste-com-pelo-menos-32-caracteres'

describe('verifyAsaasWebhookToken', () => {
	it('retorna true quando o token recebido é igual ao esperado', () => {
		expect(verifyAsaasWebhookToken(expected, expected)).toBe(true)
	})

	it('retorna false quando o token recebido é diferente mas tem o mesmo tamanho', () => {
		const tampered = `${expected.slice(0, -1)}X`

		expect(verifyAsaasWebhookToken(tampered, expected)).toBe(false)
	})

	it('retorna false quando o token difere apenas em maiúsculas e minúsculas', () => {
		expect(verifyAsaasWebhookToken(expected.toUpperCase(), expected)).toBe(
			false,
		)
	})

	it('retorna false quando o header do token está ausente', () => {
		expect(verifyAsaasWebhookToken(undefined, expected)).toBe(false)
	})

	it('retorna false quando o header do token está vazio', () => {
		expect(verifyAsaasWebhookToken('', expected)).toBe(false)
	})

	it('retorna false quando o token tem tamanho diferente do esperado', () => {
		expect(verifyAsaasWebhookToken('token-curto', expected)).toBe(false)
	})
})
