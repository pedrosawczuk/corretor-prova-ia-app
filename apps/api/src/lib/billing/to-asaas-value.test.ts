import { describe, expect, it } from 'vitest'
import { fromAsaasValue, toAsaasValue } from './to-asaas-value'

describe('toAsaasValue', () => {
	it('converte centavos para reais decimais', () => {
		expect(toAsaasValue(3990)).toBe(39.9)
	})
})

describe('fromAsaasValue', () => {
	it('converte reais decimais para centavos', () => {
		expect(fromAsaasValue(39.9)).toBe(3990)
	})

	it('arredonda imprecisões de ponto flutuante', () => {
		expect(fromAsaasValue(19.9)).toBe(1990)
	})
})
