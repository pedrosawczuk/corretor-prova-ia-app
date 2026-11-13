/**
 * Canonicalizes a request URL's pathname using the WHATWG URL parser,
 * decoding percent-encoded path segments when valid and collapsing
 * consecutive slashes so path-traversal / dot-segment variants cannot
 * bypass prefix or regex route guards.
 */
export function normalizePathname(url: string): string {
	try {
		const parsed = new URL(url, 'http://localhost')
		let decodedPathname = parsed.pathname
		try {
			decodedPathname = decodeURIComponent(parsed.pathname)
		} catch {
			// Keep parsed.pathname if percent-encoding is malformed
		}
		const canonical = new URL(decodedPathname, 'http://localhost').pathname
		return canonical.replace(/\/{2,}/g, '/')
	} catch {
		return url
	}
}
