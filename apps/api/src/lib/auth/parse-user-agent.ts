export function parseUserAgent(userAgent?: string | null) {
	if (!userAgent) {
		return 'Dispositivo desconhecido'
	}

	let browser = 'Navegador'
	if (/Edg\//.test(userAgent)) browser = 'Edge'
	else if (/Chrome\//.test(userAgent) && !/Chromium/.test(userAgent))
		browser = 'Chrome'
	else if (/Firefox\//.test(userAgent)) browser = 'Firefox'
	else if (/Safari\//.test(userAgent) && !/Chrome/.test(userAgent))
		browser = 'Safari'

	let os = ''
	if (/Windows/.test(userAgent)) os = 'Windows'
	else if (/Mac OS X/.test(userAgent)) os = 'macOS'
	else if (/Android/.test(userAgent)) os = 'Android'
	else if (/iPhone|iPad/.test(userAgent)) os = 'iOS'
	else if (/Linux/.test(userAgent)) os = 'Linux'

	return [browser, os].filter(Boolean).join(' • ') || 'Navegador desconhecido'
}
