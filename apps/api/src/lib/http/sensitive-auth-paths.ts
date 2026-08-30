const SENSITIVE_AUTH_PATH_PATTERN =
	/\/(sign-in|sign-up|forget-password|reset-password|change-password|change-email|delete-user|verify-email|email-otp|two-factor)(\/|$|\?)/

export function isSensitiveAuthPath(url: string): boolean {
	return SENSITIVE_AUTH_PATH_PATTERN.test(url)
}
