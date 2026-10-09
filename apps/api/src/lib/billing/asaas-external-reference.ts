export interface AsaasExternalReference {
	userId: string
	planSlug: string
}

export function buildAsaasExternalReference({
	userId,
	planSlug,
}: AsaasExternalReference): string {
	return `${userId}:${planSlug}`
}

export function parseAsaasExternalReference(
	value: string | undefined,
): AsaasExternalReference | null {
	if (!value) {
		return null
	}

	const parts = value.split(':')
	const [userId, planSlug] = parts

	if (parts.length !== 2 || !userId || !planSlug) {
		return null
	}

	return { userId, planSlug }
}
