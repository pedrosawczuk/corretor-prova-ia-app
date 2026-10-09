export function toAsaasValue(cents: number): number {
	return cents / 100
}

export function fromAsaasValue(value: number): number {
	return Math.round(value * 100)
}
