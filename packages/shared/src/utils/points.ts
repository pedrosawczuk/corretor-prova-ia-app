export function formatPoints(value: string): string {
	const number = Number(value)
	return Number.isNaN(number) ? value : String(number)
}
