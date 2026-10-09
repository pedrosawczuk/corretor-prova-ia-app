const CPF_LENGTH = 11
const CNPJ_LENGTH = 14
const CNPJ_FIRST_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const CNPJ_SECOND_DIGIT_WEIGHTS = [6, ...CNPJ_FIRST_DIGIT_WEIGHTS]

function toDigits(value: string): number[] {
	return value.split('').map(Number)
}

function hasOnlyRepeatedDigits(value: string): boolean {
	return /^(\d)\1*$/.test(value)
}

function calculateCheckDigit(digits: number[], weights: number[]): number {
	const sum = weights.reduce(
		(total, weight, index) => total + weight * digits[index],
		0,
	)
	const remainder = sum % 11

	return remainder < 2 ? 0 : 11 - remainder
}

function isValidCpf(value: string): boolean {
	const digits = toDigits(value)
	const firstWeights = Array.from({ length: 9 }, (_, index) => 10 - index)
	const secondWeights = Array.from({ length: 10 }, (_, index) => 11 - index)

	return (
		calculateCheckDigit(digits, firstWeights) === digits[9] &&
		calculateCheckDigit(digits, secondWeights) === digits[10]
	)
}

function isValidCnpj(value: string): boolean {
	const digits = toDigits(value)

	return (
		calculateCheckDigit(digits, CNPJ_FIRST_DIGIT_WEIGHTS) === digits[12] &&
		calculateCheckDigit(digits, CNPJ_SECOND_DIGIT_WEIGHTS) === digits[13]
	)
}

export function isValidCpfCnpj(value: string): boolean {
	if (!/^\d+$/.test(value) || hasOnlyRepeatedDigits(value)) {
		return false
	}

	if (value.length === CPF_LENGTH) {
		return isValidCpf(value)
	}

	if (value.length === CNPJ_LENGTH) {
		return isValidCnpj(value)
	}

	return false
}
