import { z } from 'zod'
import { isValidCpfCnpj } from './is-valid-cpf-cnpj'

export const taxIdSchema = z
	.string()
	.transform((value) => value.replace(/\D/g, ''))
	.refine(isValidCpfCnpj, 'CPF ou CNPJ inválido.')

export type TaxId = z.infer<typeof taxIdSchema>
