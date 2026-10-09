import { isValidCpfCnpj, taxIdSchema } from '@app/shared'
import { describe, expect, it } from 'vitest'

describe('isValidCpfCnpj', () => {
	it.each(['52998224725', '11144477735', '11222333000181', '45997418000153'])(
		'aceita o documento válido %s',
		(value) => {
			expect(isValidCpfCnpj(value)).toBe(true)
		},
	)

	it.each([
		'',
		'11111111111',
		'00000000000000',
		'52998224724',
		'11222333000182',
		'1234567890',
		'123456789012',
		'5299822472a',
	])('rejeita o documento inválido %j', (value) => {
		expect(isValidCpfCnpj(value)).toBe(false)
	})
})

describe('taxIdSchema', () => {
	it('remove a máscara e mantém apenas os dígitos', () => {
		expect(taxIdSchema.parse('529.982.247-25')).toBe('52998224725')
		expect(taxIdSchema.parse('11.222.333/0001-81')).toBe('11222333000181')
	})

	it('rejeita CPF com sequência repetida', () => {
		const result = taxIdSchema.safeParse('111.111.111-11')

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('CPF ou CNPJ inválido.')
	})
})
