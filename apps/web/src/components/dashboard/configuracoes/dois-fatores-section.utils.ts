export function extractSecret(totpURI: string) {
	try {
		return new URL(totpURI).searchParams.get('secret')
	} catch {
		return null
	}
}
