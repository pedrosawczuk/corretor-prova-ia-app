import { describe, expect, it } from 'vitest'
import {
	buildAsaasExternalReference,
	parseAsaasExternalReference,
} from './asaas-external-reference'

describe('buildAsaasExternalReference', () => {
	it('junta userId e planSlug separados por dois-pontos', () => {
		expect(
			buildAsaasExternalReference({ userId: 'user_1', planSlug: 'pro' }),
		).toBe('user_1:pro')
	})
})

describe('parseAsaasExternalReference', () => {
	it('retorna userId e planSlug de uma referência válida', () => {
		expect(parseAsaasExternalReference('user_1:pro')).toEqual({
			userId: 'user_1',
			planSlug: 'pro',
		})
	})

	it.each([undefined, '', 'abc', 'a:b:c', ':pro', 'user_1:'])(
		'retorna null para a referência inválida %j',
		(value) => {
			expect(parseAsaasExternalReference(value)).toBeNull()
		},
	)
})
